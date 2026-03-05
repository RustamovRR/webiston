import React from "react"

interface CustomParagraphProps {
  children: React.ReactNode
  [key: string]: any
}

export default function CustomParagraph({
  children,
  ...props
}: CustomParagraphProps) {
  // Convert any div children to span to avoid nesting issues
  const processChildren = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) {
        return child
      }

      const element = child as React.ReactElement<any>

      // If it's a div, convert to span with block display
      if (element.type === "div") {
        const { className = "", ...restProps } = element.props
        return (
          <span className={`block ${className}`} {...restProps}>
            {element.props.children}
          </span>
        )
      }

      // Recursively process nested children
      if (element.props?.children) {
        return React.cloneElement(element, {
          children: processChildren(element.props.children)
        })
      }

      return child
    })
  }

  return (
    <p className="!m-0 !mt-6" {...props}>
      {processChildren(children)}
    </p>
  )
}
