import { useRef, useEffect, useCallback, useState } from 'react'
import { Bold, Italic, Heading3, Pilcrow, List, ListOrdered, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isTyping = useRef(false)
  const [isEmpty, setIsEmpty] = useState(!value)

  useEffect(() => {
    if (editorRef.current && !isTyping.current) {
      const current = editorRef.current.innerHTML
      if (current !== value) {
        editorRef.current.innerHTML = value || ''
        const text = (value || '').replace(/<[^>]*>/g, '').trim()
        setIsEmpty(text.length === 0)
      }
    }
  }, [value])

  const runCommand = useCallback(
    (command: string, val?: string) => {
      document.execCommand(command, false, val)
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML)
      }
    },
    [onChange],
  )

  const addLink = useCallback(() => {
    const url = window.prompt('URL do link:')
    if (url) runCommand('createLink', url)
  }, [runCommand])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      onChange(html)
      const text = html.replace(/<[^>]*>/g, '').trim()
      setIsEmpty(text.length === 0)
    }
  }, [onChange])

  const tools = [
    { icon: Bold, action: () => runCommand('bold') },
    { icon: Italic, action: () => runCommand('italic') },
    { icon: Heading3, action: () => runCommand('formatBlock', '<h3>') },
    { icon: Pilcrow, action: () => runCommand('formatBlock', '<p>') },
    { icon: List, action: () => runCommand('insertUnorderedList') },
    { icon: ListOrdered, action: () => runCommand('insertOrderedList') },
    { icon: Link2, action: addLink },
  ]

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
      <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
        {tools.map((tool, i) => {
          const Icon = tool.icon
          return (
            <Button
              key={i}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onMouseDown={(e) => e.preventDefault()}
              onClick={tool.action}
            >
              <Icon className="h-4 w-4" />
            </Button>
          )
        })}
      </div>
      <div className="relative">
        {isEmpty && placeholder && (
          <span className="absolute top-4 left-4 text-slate-400 pointer-events-none select-none">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => {
            isTyping.current = true
          }}
          onBlur={() => {
            isTyping.current = false
          }}
          onInput={handleInput}
          className={cn(
            'p-4 min-h-[300px] focus:outline-none text-sm text-slate-700 leading-relaxed',
            '[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-slate-800',
            '[&_p]:my-2',
            '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2',
            '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2',
            '[&_li]:my-1',
            '[&_a]:text-primary [&_a]:underline',
            '[&_strong]:font-bold [&_em]:italic',
          )}
        />
      </div>
    </div>
  )
}
