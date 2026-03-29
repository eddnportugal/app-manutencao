import * as React from "react";
import { createPortal } from "react-dom";

/**
 * Custom Portal wrapper that handles React 19 compatibility
 * This fixes the "removeChild" error that occurs with Radix UI portals in React 19
 * 
 * The error "Failed to execute 'removeChild' on 'Node': The node to be removed 
 * is not a child of this node" happens because React 19's concurrent features 
 * can cause timing issues with Radix UI's portal cleanup.
 */
export function SafePortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    // Create a container div for the portal
    const container = document.createElement('div');
    container.setAttribute('data-radix-portal', '');
    document.body.appendChild(container);
    containerRef.current = container;
    setMounted(true);

    return () => {
      // Clean up on unmount - use setTimeout to avoid the removeChild error
      // This delays the removal to ensure React has finished its cleanup
      setTimeout(() => {
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }, 0);
    };
  }, []);

  if (!mounted || !containerRef.current) {
    return null;
  }

  return createPortal(children, containerRef.current);
}
