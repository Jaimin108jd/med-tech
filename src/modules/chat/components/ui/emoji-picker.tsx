"use client"

import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface EmojiPickerProps {
  onChange: (emoji: string) => void
  children: React.ReactNode
}

export function EmojiPicker({ onChange, children }: EmojiPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-full p-0 border-none">
        <Picker
          data={data}
          onEmojiSelect={(emoji: any) => onChange(emoji.native)}
          theme="light"
          previewPosition="none"
        />
      </PopoverContent>
    </Popover>
  )
}