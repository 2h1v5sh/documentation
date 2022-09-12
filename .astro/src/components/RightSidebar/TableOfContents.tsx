import type { FunctionalComponent } from "preact"
import { h } from "preact"
import { useState, useEffect, useRef } from "preact/hooks"
interface Heading {
  depth: number
  text: string
  slug: string
}

const TableOfContents: FunctionalComponent<{ headers: Heading[] }> = ({
  headers = [],
}) => {
  headers = [...headers].filter(({ depth }) => depth > 1 && depth < 4)
  const tableOfContents = useRef<HTMLUListElement>()
  const [currentID, setCurrentID] = useState("overview")
  const onThisPageID = "on-this-page-heading"

  useEffect(() => {
    if (!tableOfContents.current) return

    const setCurrent: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const { id } = entry.target
          if (id === onThisPageID) continue
          setCurrentID(entry.target.id)
          break
        }
      }
    }

    const observerOptions: IntersectionObserverInit = {
      // Negative top margin accounts for `scroll-margin`.
      // Negative bottom margin means heading needs to be towards top of viewport to trigger intersection.
      rootMargin: "-100px 0% -66%",
      threshold: 1,
    }

    const headingsObserver = new IntersectionObserver(
      setCurrent,
      observerOptions
    )

    // Observe all the headings in the main page content.
    document
      .querySelectorAll("article :is(h1,h2,h3)")
      .forEach((h) => headingsObserver.observe(h))

    // Stop observing when the component is unmounted.
    return () => headingsObserver.disconnect()
  }, [tableOfContents.current])

  return (
    <>
      <h2 className="heading">On this page</h2>
      <ul ref={tableOfContents}>
        <li
          className={`header-link depth-2 ${
            currentID === "overview" ? "active" : ""
          }`.trim()}
        >
          <a href="#overview">Overview</a>
        </li>
        {headers
          .filter(({ depth }) => depth > 1 && depth < 4)
          .map((header) => (
            <li
              className={`header-link depth-${header.depth} ${
                currentID === header.slug ? "active" : ""
              }`.trim()}
            >
              <a href={`#${header.slug}`}>{header.text}</a>
            </li>
          ))}
      </ul>
    </>
  )
}

export default TableOfContents