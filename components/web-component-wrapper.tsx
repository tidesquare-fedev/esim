"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface WebComponentWrapperProps {
  tagName: string
  attributes?: Record<string, string | number | boolean>
  children?: React.ReactNode
  fallback?: React.ReactNode
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

export default function WebComponentWrapper({
  tagName,
  attributes = {},
  children,
  fallback = null,
}: WebComponentWrapperProps) {
  const [isClient, setIsClient] = useState(false)
  const [isComponentDefined, setIsComponentDefined] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // 웹 컴포넌트가 정의되어 있는지 확인
    const checkComponent = () => {
      if (customElements.get(tagName)) {
        setIsComponentDefined(true)
      } else {
        // 웹 컴포넌트가 정의될 때까지 기다림
        customElements
          .whenDefined(tagName)
          .then(() => {
            setIsComponentDefined(true)
          })
          .catch(() => {
            console.warn(`Web component ${tagName} failed to load`)
          })
      }
    }

    checkComponent()
  }, [tagName])

  // 서버 사이드에서는 fallback 렌더링
  if (!isClient) {
    return <>{fallback}</>
  }

  // 클라이언트 사이드에서 웹 컴포넌트가 아직 로드되지 않았으면 fallback
  if (!isComponentDefined && fallback) {
    return <>{fallback}</>
  }

  // 웹 컴포넌트 렌더링
  const Component = tagName as any

  return <Component {...attributes}>{children}</Component>
}
