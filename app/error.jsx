"use client";

import RuntimeError from "@/components/errors/RuntimeError";
import ThemeWrapper from "@/components/mui-theme/ThemeWrapper";

const error = ({error, reset}) => {
  return (
    <ThemeWrapper>
      <RuntimeError error={error} reset={reset} />
    </ThemeWrapper>
  );
};

export default error;
