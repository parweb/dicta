/**
 * Scrollbar Drag Hook
 * Manages drag interaction logic for scrollbar
 */

import { useEffect, useRef, useState } from 'react'

interface UseScrollbarDragProps {
  scrollProgress: number
  thumbHeight: number
  onScroll: (progress: number) => void
}

export function useScrollbarDrag({
  scrollProgress,
  thumbHeight,
  onScroll
}: UseScrollbarDragProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ y: number; scrollProgress: number } | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = {
      y: e.clientY,
      scrollProgress
    }
  }

  useEffect(() => {
    if (!isDragging || !dragStartRef.current) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current || !dragStartRef.current) return

      const rect = trackRef.current.getBoundingClientRect()
      const deltaY = e.clientY - dragStartRef.current.y
      const deltaProgress = deltaY / (rect.height - thumbHeight)
      const newProgress = Math.max(
        0,
        Math.min(1, dragStartRef.current.scrollProgress + deltaProgress)
      )

      onScroll(newProgress)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      dragStartRef.current = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, onScroll, thumbHeight])

  return {
    isDragging,
    trackRef,
    handleMouseDown
  }
}
