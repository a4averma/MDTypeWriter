import React, { useEffect, useRef } from "react";
import Reveal from "reveal.js";
import RevealMarkdown from "reveal.js/plugin/markdown/markdown.esm.js";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/white.css";

interface PresentationViewerProps {
  content: string;
  isFullscreen?: boolean;
}

const PresentationViewer: React.FC<PresentationViewerProps> = ({
  content,
  isFullscreen = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<any>(null);

  // Process content and detect presentation type
  const processContent = (rawContent: string) => {
    // Check if it's a Reveal.js presentation (has horizontal or vertical slides)
    const hasSlides =
      rawContent.includes("\n---\n") || // Horizontal slides
      rawContent.includes("\n----\n") || // Vertical slides
      rawContent.match(/<!--.*?slide.*?-->/); // HTML slide comments

    if (hasSlides) {
      return {
        content: rawContent,
        type: "reveal",
      };
    }

    // If no clear presentation markers, wrap content in a single slide
    return {
      content: rawContent,
      type: "reveal",
    };
  };

  const { content: markdownContent } = processContent(content);

  useEffect(() => {
    let deck: any = null;

    const initializeReveal = async () => {
      if (!containerRef.current) return;

      try {
        deck = new Reveal(containerRef.current, {
          plugins: [RevealMarkdown],
          markdown: {
            smartypants: true,
            breaks: true,
          },
          width: "100%",
          height: "100%",
          margin: 0.1,
          minScale: 0.2,
          maxScale: 2.0,
          controls: true,
          controlsTutorial: true,
          controlsLayout: "bottom-right",
          controlsBackArrows: "faded",
          progress: true,
          center: true,
          transition: "slide",
          embedded: false,
          hash: false,
        });

        await deck.initialize();
        deckRef.current = deck;
      } catch (error) {
        console.error("Failed to initialize Reveal.js:", error);
      }
    };

    initializeReveal();

    // Handle fullscreen
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        const event = new CustomEvent("fullscreenchange", { detail: false });
        window.dispatchEvent(event);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    if (isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (!isFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (deck) {
        try {
          // Remove event listeners and clean up
          deck.getRevealElement()?.removeEventListener("click", deck.onClick);
          deck
            .getRevealElement()
            ?.removeEventListener("touchstart", deck.onTouchStart);
          deck
            .getRevealElement()
            ?.removeEventListener("touchmove", deck.onTouchMove);
          deck
            .getRevealElement()
            ?.removeEventListener("touchend", deck.onTouchEnd);
          window.removeEventListener("resize", deck.onWindowResize);
          window.removeEventListener("keydown", deck.onKeyDown);

          // Clear the deck reference
          deckRef.current = null;
        } catch (error) {
          console.error("Failed to cleanup Reveal.js:", error);
        }
      }
    };
  }, [isFullscreen, markdownContent]);

  return (
    <div
      ref={containerRef}
      className={`reveal ${
        isFullscreen ? "fixed inset-0 z-50 bg-black" : "w-full h-full"
      }`}
    >
      <div className="slides">
        {markdownContent.split(/\n---\n/).map((slideContent, index) => (
          <section
            key={index}
            data-markdown=""
            data-separator-vertical="^\\n----\\n$"
            data-separator-notes="^Note:"
          >
            <textarea data-template defaultValue={slideContent.trim()} />
          </section>
        ))}
      </div>

      {/* Navigation controls */}
      <div className="navigate-left" />
      <div className="navigate-right" />
      <div className="navigate-up" />
      <div className="navigate-down" />

      {/* Progress bar */}
      <div className="progress" />

      <style>
        {`
          .reveal {
            height: 100%;
            position: relative;
            transform-style: preserve-3d;
          }

          .reveal .slides {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin: auto;
            pointer-events: none;
            overflow: visible;
            z-index: 1;
            text-align: center;
            transform-style: preserve-3d;
            perspective: 600px;
          }

          .reveal .slides > section {
            perspective: 600px;
          }

          .reveal .slides > section,
          .reveal .slides > section > section {
            display: block;
            position: absolute;
            width: 100%;
            padding: 20px 0;
            pointer-events: auto;
            z-index: 10;
          }

          .reveal h1 {
            font-size: 2.5em;
            margin-bottom: 0.5em;
          }

          .reveal h2 {
            font-size: 2em;
            margin-bottom: 0.5em;
          }

          .reveal p {
            font-size: 1.2em;
            line-height: 1.6;
          }

          .reveal ul,
          .reveal ol {
            font-size: 1.2em;
            line-height: 1.6;
            text-align: left;
            margin-left: 2em;
          }

          .reveal pre,
          .reveal code {
            font-family: monospace;
            background: #f0f0f0;
            padding: 0.2em 0.4em;
            border-radius: 3px;
          }

          .reveal pre {
            padding: 1em;
            margin: 1em 0;
            white-space: pre-wrap;
          }

          .reveal blockquote {
            border-left: 4px solid #ccc;
            padding-left: 1em;
            margin: 1em 0;
            font-style: italic;
          }

          .reveal img {
            max-width: 100%;
            height: auto;
          }

          .reveal table {
            margin: 1em 0;
            border-collapse: collapse;
          }

          .reveal th,
          .reveal td {
            border: 1px solid #ccc;
            padding: 0.5em;
          }

          /* Navigation Controls */
          .navigate-left,
          .navigate-right,
          .navigate-up,
          .navigate-down {
            position: fixed;
            z-index: 20;
            font-size: 24px;
            opacity: 0.3;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .navigate-left:hover,
          .navigate-right:hover,
          .navigate-up:hover,
          .navigate-down:hover {
            opacity: 1;
          }

          /* Progress bar */
          .progress {
            position: fixed;
            bottom: 0;
            width: 100%;
            height: 3px;
            background-color: rgba(0, 0, 0, 0.2);
            z-index: 20;
          }

          .progress:after {
            content: '';
            position: absolute;
            height: 100%;
            background-color: #2196f3;
            transition: width 0.8s ease;
          }
        `}
      </style>
    </div>
  );
};

export default PresentationViewer;
