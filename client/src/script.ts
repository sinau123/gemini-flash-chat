import "./style.css";
import { marked } from "marked";
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input") as HTMLInputElement | null;
const chatBox = document.getElementById("chat-box");

console.log(import.meta.env);

form?.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!input || !chatBox) {
    return;
  }

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  input.value = "";

  function deleteThinkingMessage(chatBox: HTMLElement) {
    const thinkingMessage = chatBox.lastChild;

    if (!(thinkingMessage instanceof HTMLElement)) {
      return;
    }
    if (thinkingMessage && thinkingMessage.classList.contains("thinking")) {
      chatBox.removeChild(thinkingMessage);
    }
  }

  try {
    appendMessage("bot", "Gemini is thinking...", "thinking");
    input.disabled = true;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}generate-text`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userMessage }),
      }
    );

    deleteThinkingMessage(chatBox);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { data } = (await response.json()) as { data: string };
    const str = await marked(data);

    appendMessage("bot", str, undefined, true);
  } catch (error) {
    if (error instanceof Error) {
      deleteThinkingMessage(chatBox);
      appendMessage("bot", error.message);
    }
  } finally {
    input.disabled = false;
  }
});

function appendMessage(sender: string, text: string, extraClass?: string, rawHTML?: boolean) {
  if (!chatBox) {
    return;
  }
  const msg = document.createElement("div");
  msg.classList.add(...(extraClass ? [extraClass] : []), "message", sender);
  if (!rawHTML) {
  msg.textContent = text;
  } else {
    msg.innerHTML = text;
  }
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}
