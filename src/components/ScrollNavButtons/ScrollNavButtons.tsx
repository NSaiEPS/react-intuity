import { useState, useEffect, useLayoutEffect } from "react";
import { Fab, Stack, Tooltip } from "@mui/material";
import { ArrowUp, ArrowDown } from "@phosphor-icons/react";

export default function ScrollNavButtons() {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const checkScroll = () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    setIsAtTop(scrollTop === 0);
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 5);
  };

  useLayoutEffect(() => {
    window.addEventListener("scroll", checkScroll);
    return () => window.removeEventListener("scroll", checkScroll);
  }, []);

  // Separate delayed check on mount for correct initial state
  useEffect(() => {
    const timer = setTimeout(checkScroll, 300); // wait for full page render
    return () => clearTimeout(timer);
  }, []);

  if (isAtTop && isAtBottom) return null;

  return (
    <Stack spacing={1} sx={{ position: "fixed", bottom: 32, right: 32, zIndex: 1000 }}>
      {!isAtTop && (
        <Tooltip title="Scroll to Top" placement="left">
          <Fab size="small" onClick={scrollToTop} color="primary">
            <ArrowUp size={20} weight="bold" />
          </Fab>
        </Tooltip>
      )}
      {!isAtBottom && (
        <Tooltip title="Scroll to Bottom" placement="left">
          <Fab size="small" onClick={scrollToBottom} color="primary">
            <ArrowDown size={20} weight="bold" />
          </Fab>
        </Tooltip>
      )}
    </Stack>
  );

  function scrollToTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }
  function scrollToBottom() { window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); }
}