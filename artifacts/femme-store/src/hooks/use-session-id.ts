import { useEffect, useState } from "react";

export function useSessionId() {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    let id = localStorage.getItem("femme_flow_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("femme_flow_session_id", id);
    }
    setSessionId(id);
  }, []);

  return sessionId;
}
