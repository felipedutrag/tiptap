"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"
import type { Node } from "@tiptap/pm/model"
import { NodeSelection } from "@tiptap/pm/state"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useHotkeys } from "react-hotkeys-hook"
import { useIsMobile } from "@/hooks/use-mobile"

// --- Lib ---
import { parseShortcutKeys } from "@/lib/tiptap-utils"

// --- Icons ---
import { LinkIcon } from "@/components/tiptap-icons/link-icon"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Badge } from "@/components/tiptap-ui-primitive/badge"

export interface CopyAnchorLinkButtonProps extends Omit<ButtonProps, "type"> {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * Whether the button should hide when no links are available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Called when the copy operation finishes.
   * Provides a boolean indicating whether any links were found.
   */
  onLinkNotFound?: (found: boolean) => void
  /**
   * Called after links are extracted from the node.
   * Provides all extracted links, even if none were found (empty array).
   */
  onExtractedLinks?: (links: string[]) => void
  /**
   * Callback function called after a successful copy operation.
   */
  onCopied?: () => void
  /**
   * Optional show shortcut keys in the button.
   * @default false
   */
  showShortcut?: boolean
}

/**
 * Configuration for the copy anchor link functionality
 */
export interface UseCopyAnchorLinkConfig {
  /**
   * The Tiptap editor instance.
   */
  editor?: Editor | null
  /**
   * Whether the button should hide when no links are available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Called when the copy operation finishes.
   * Provides a boolean indicating whether any links were found.
   */
  onLinkNotFound?: (found: boolean) => void
  /**
   * Called after links are extracted from the node.
   * Provides all extracted links, even if none were found (empty array).
   */
  onExtractedLinks?: (links: string[]) => void
  /**
   * Callback function called after a successful copy operation.
   */
  onCopied?: () => void
}

/**
 * Extracts links from a node
 */
export function extractLinksFromNode(node: Node | null): string[] {
  if (!node) return []

  const links: string[] = []

  try {
    if (node.type.name === "link" && node.attrs?.href) {
      links.push(node.attrs.href)
    }

    node.descendants?.((child) => {
      if (child.type.name === "link" && child.attrs?.href) {
        links.push(child.attrs.href)
      }

      if (child.marks) {
        child.marks.forEach((mark) => {
          if (mark.type.name === "link" && mark.attrs?.href) {
            links.push(mark.attrs.href)
          }
        })
      }

      return true
    })

    return [...new Set(links)]
  } catch {
    return []
  }
}

/**
 * Checks if a node contains any links that can be copied
 */
export function canCopyAnchorLink(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false

  const { selection } = editor.state
  const node =
    selection instanceof NodeSelection
      ? selection.node
      : selection.$anchor.node(1)

  const links = extractLinksFromNode(node)
  return links.length > 0
}

/**
 * Extracts and copies links from a node to clipboard
 */
export async function copyAnchorLink(
  editor: Editor | null,
  onExtractedLinks?: (links: string[]) => void,
  onLinkNotFound?: (notFound: boolean) => void
): Promise<boolean> {
  if (!editor || !editor.isEditable) return false

  const { selection } = editor.state
  const node =
    selection instanceof NodeSelection
      ? selection.node
      : selection.$anchor.node(1)

  const links = extractLinksFromNode(node)
  const hasLinks = links.length > 0

  onExtractedLinks?.(links)
  onLinkNotFound?.(!hasLinks)

  if (!hasLinks) return false

  try {
    await navigator.clipboard.writeText(links.join("\n"))
    return true
  } catch {
    return false
  }
}

/**
 * Determines if the copy anchor link button should be shown
 */
export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  const { editor, hideWhenUnavailable } = props

  if (!editor || !editor.isEditable) return false

  if (hideWhenUnavailable && !editor.isActive("code")) {
    return canCopyAnchorLink(editor)
  }

  return true
}

/**
 * Custom hook that provides copy anchor link functionality for Tiptap editor
 *
 * @example
 * ```tsx
 * // Simple usage - no params needed
 * function MySimpleCopyLinkButton() {
 *   const { isVisible, handleCopyAnchorLink } = useCopyAnchorLink()
 *
 *   if (!isVisible) return null
 *
 *   return <button onClick={handleCopyAnchorLink}>Copy Links</button>
 * }
 *
 * // Advanced usage with configuration
 * function MyAdvancedCopyLinkButton() {
 *   const { isVisible, handleCopyAnchorLink, label } = useCopyAnchorLink({
 *     editor: myEditor,
 *     hideWhenUnavailable: true,
 *     onCopied: () => console.log('Links copied!')
 *   })
 *
 *   if (!isVisible) return null
 *
 *   return (
 *     <MyButton
 *       onClick={handleCopyAnchorLink}
 *       aria-label={label}
 *     >
 *       Copy Anchor Links
 *     </MyButton>
 *   )
 * }
 * ```
 */
export function useCopyAnchorLink(config?: UseCopyAnchorLinkConfig) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    onLinkNotFound,
    onExtractedLinks,
    onCopied,
  } = config || {}

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = React.useState<boolean>(true)
  const canCopyAnchorLinkState = canCopyAnchorLink(editor)

  React.useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }))
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const handleCopyAnchorLink = React.useCallback(async () => {
    if (!editor) return false

    const success = await copyAnchorLink(
      editor,
      onExtractedLinks,
      onLinkNotFound
    )

    if (success) {
      onCopied?.()
    }

    return success
  }, [editor, onExtractedLinks, onLinkNotFound, onCopied])

  useHotkeys(
    "mod+shift+c",
    (event) => {
      event.preventDefault()
      handleCopyAnchorLink()
    },
    {
      enabled: isVisible && canCopyAnchorLinkState,
      enableOnContentEditable: !isMobile,
      enableOnFormTags: true,
    }
  )

  return {
    isVisible,
    canCopyAnchorLink: canCopyAnchorLinkState,
    handleCopyAnchorLink,
    label: "Copy anchor link",
    shortcutKeys: "Ctrl+Shift+C",
  }
}

export function CopyAnchorLinkShortcutBadge({
  shortcutKeys,
}: {
  shortcutKeys?: string
}) {
  return <Badge>{parseShortcutKeys({ shortcutKeys })}</Badge>
}

/**
 * Button component for copying anchor links from a node in a Tiptap editor.
 *
 * For custom button implementations, use the `useCopyAnchorLink` hook instead.
 */
export const CopyAnchorLinkButton = React.forwardRef<
  HTMLButtonElement,
  CopyAnchorLinkButtonProps
>(
  (
    {
      editor: providedEditor,
      text,
      hideWhenUnavailable = false,
      onLinkNotFound,
      onExtractedLinks,
      onCopied,
      showShortcut = false,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const { isVisible, handleCopyAnchorLink, label, shortcutKeys } =
      useCopyAnchorLink({
        editor,
        hideWhenUnavailable,
        onLinkNotFound,
        onExtractedLinks,
        onCopied,
      })

    const handleClick = React.useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        await handleCopyAnchorLink()
      },
      [handleCopyAnchorLink, onClick]
    )

    if (!isVisible) {
      return null
    }

    return (
      <Button
        type="button"
        data-style="ghost"
        role="button"
        tabIndex={-1}
        aria-label={label}
        tooltip="Copy anchor link"
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <LinkIcon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
            {showShortcut && (
              <CopyAnchorLinkShortcutBadge shortcutKeys={shortcutKeys} />
            )}
          </>
        )}
      </Button>
    )
  }
)

CopyAnchorLinkButton.displayName = "CopyAnchorLinkButton"
