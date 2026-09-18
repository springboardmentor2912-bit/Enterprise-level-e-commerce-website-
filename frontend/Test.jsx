import { useState } from "react";

export default function Test() {
  const [count] = useState(0);

  return <h1>{count}</h1>;
}