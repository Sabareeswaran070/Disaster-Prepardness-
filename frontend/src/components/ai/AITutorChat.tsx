import {
    Bot,
    Send,
    User,
} from "lucide-react";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import ReactMarkdown from "react-markdown";

import {
    chatWithAI,
} from "../../api/ai";


interface Message {
    id: number;
    role: "user" | "assistant";
    content: string;
}


function AITutorChat() {

    const [messages, setMessages] =
        useState<Message[]>([
            {
                id: 1,
                role: "assistant",
                content:
                    "Hello! I am your Disaster Preparedness AI Tutor. Ask me about disaster preparedness, response, recovery, lessons, or safety procedures.",
            },
        ]);


    const [input, setInput] =
        useState("");


    const [loading, setLoading] =
        useState(false);


    const messagesEndRef =
        useRef<HTMLDivElement | null>(null);


    /*
     * Automatically scroll to the
     * latest message.
     */
    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [messages]);


    /*
     * Send message to backend AI.
     */
    const handleSubmit =
        async (
            event: React.FormEvent
        ) => {

            event.preventDefault();

            const message =
                input.trim();


            if (
                !message ||
                loading
            ) {
                return;
            }


            const userMessage: Message = {
                id: Date.now(),
                role: "user",
                content: message,
            };


            setMessages(
                previous => [
                    ...previous,
                    userMessage,
                ]
            );


            setInput("");
            setLoading(true);


            try {

                const response =
                    await chatWithAI(
                        message
                    );


                const assistantMessage: Message = {
                    id: Date.now() + 1,
                    role: "assistant",
                    content:
                        response.answer,
                };


                setMessages(
                    previous => [
                        ...previous,
                        assistantMessage,
                    ]
                );

            } catch (error) {

                console.error(
                    "AI Tutor error:",
                    error
                );


                const errorMessage: Message = {
                    id: Date.now() + 1,
                    role: "assistant",
                    content:
                        "Sorry, I could not process your question right now. Please try again.",
                };


                setMessages(
                    previous => [
                        ...previous,
                        errorMessage,
                    ]
                );

            } finally {

                setLoading(false);

            }
        };


    return (

        <div className="flex h-[calc(100vh-8rem)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* =========================
                Header
            ========================== */}

            <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">

                    <Bot
                        size={24}
                    />

                </div>


                <div>

                    <h2 className="text-lg font-bold text-slate-900">
                        Disaster AI Tutor
                    </h2>

                    <p className="text-sm text-slate-500">
                        Ask questions about disaster preparedness and safety
                    </p>

                </div>

            </div>


            {/* =========================
                Messages
            ========================== */}

            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">

                <div className="mx-auto flex max-w-4xl flex-col gap-5">

                    {messages.map(
                        message => (

                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.role === "user"
                                    ? "justify-end"
                                    : "justify-start"
                                    }`}
                            >

                                {/* Assistant Avatar */}

                                {message.role === "assistant" && (

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">

                                        <Bot
                                            size={18}
                                        />

                                    </div>

                                )}


                                {/* =========================
                                    Message Bubble
                                ========================== */}

                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user"
                                        ? "rounded-br-md bg-blue-600 text-white"
                                        : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                                        }`}
                                >

                                    {message.role === "assistant" ? (

                                        /*
                                         * Render AI Markdown properly.
                                         *
                                         * No `prose` class is used.
                                         * Therefore Tailwind Typography
                                         * is NOT required.
                                         */

                                        <ReactMarkdown
                                            components={{

                                                /*
                                                 * Paragraph
                                                 */

                                                p: ({
                                                    children,
                                                }) => (

                                                    <p className="mb-3 last:mb-0">
                                                        {children}
                                                    </p>

                                                ),


                                                /*
                                                 * Bold text
                                                 */

                                                strong: ({
                                                    children,
                                                }) => (

                                                    <strong className="font-bold text-slate-900">
                                                        {children}
                                                    </strong>

                                                ),


                                                /*
                                                 * Italic text
                                                 */

                                                em: ({
                                                    children,
                                                }) => (

                                                    <em className="italic">
                                                        {children}
                                                    </em>

                                                ),


                                                /*
                                                 * Heading 1
                                                 */

                                                h1: ({
                                                    children,
                                                }) => (

                                                    <h1 className="mb-3 mt-4 text-lg font-bold text-slate-900 first:mt-0">
                                                        {children}
                                                    </h1>

                                                ),


                                                /*
                                                 * Heading 2
                                                 */

                                                h2: ({
                                                    children,
                                                }) => (

                                                    <h2 className="mb-3 mt-4 text-base font-bold text-slate-900 first:mt-0">
                                                        {children}
                                                    </h2>

                                                ),


                                                /*
                                                 * Heading 3
                                                 */

                                                h3: ({
                                                    children,
                                                }) => (

                                                    <h3 className="mb-2 mt-3 font-semibold text-slate-900 first:mt-0">
                                                        {children}
                                                    </h3>

                                                ),


                                                /*
                                                 * Unordered list
                                                 */

                                                ul: ({
                                                    children,
                                                }) => (

                                                    <ul className="mb-3 list-disc space-y-1 pl-5">
                                                        {children}
                                                    </ul>

                                                ),


                                                /*
                                                 * Ordered list
                                                 */

                                                ol: ({
                                                    children,
                                                }) => (

                                                    <ol className="mb-3 list-decimal space-y-1 pl-5">
                                                        {children}
                                                    </ol>

                                                ),


                                                /*
                                                 * List item
                                                 */

                                                li: ({
                                                    children,
                                                }) => (

                                                    <li className="pl-1">
                                                        {children}
                                                    </li>

                                                ),


                                                /*
                                                 * Inline code
                                                 */

                                                code: ({
                                                    children,
                                                }) => (

                                                    <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs text-slate-800">
                                                        {children}
                                                    </code>

                                                ),


                                                /*
                                                 * Block quote
                                                 */

                                                blockquote: ({
                                                    children,
                                                }) => (

                                                    <blockquote className="my-3 border-l-4 border-blue-300 pl-4 italic text-slate-600">
                                                        {children}
                                                    </blockquote>

                                                ),


                                                /*
                                                 * Horizontal rule
                                                 */

                                                hr: () => (

                                                    <hr className="my-4 border-slate-200" />

                                                ),

                                            }}
                                        >

                                            {message.content}

                                        </ReactMarkdown>

                                    ) : (

                                        /*
                                         * User messages remain
                                         * plain text.
                                         */

                                        <div className="whitespace-pre-wrap">
                                            {message.content}
                                        </div>

                                    )}

                                </div>


                                {/* User Avatar */}

                                {message.role === "user" && (

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">

                                        <User
                                            size={18}
                                        />

                                    </div>

                                )}

                            </div>

                        )
                    )}


                    {/* =========================
                        Loading Indicator
                    ========================== */}

                    {loading && (

                        <div className="flex gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">

                                <Bot
                                    size={18}
                                />

                            </div>


                            <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3">

                                <div className="flex gap-1">

                                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />

                                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />

                                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />

                                </div>

                            </div>

                        </div>

                    )}


                    {/* Scroll target */}

                    <div
                        ref={messagesEndRef}
                    />

                </div>

            </div>


            {/* =========================
                Input
            ========================== */}

            <form
                onSubmit={handleSubmit}
                className="border-t border-slate-200 bg-white p-4"
            >

                <div className="mx-auto flex max-w-4xl items-end gap-3">

                    <textarea
                        value={input}

                        onChange={
                            event =>
                                setInput(
                                    event.target.value
                                )
                        }

                        onKeyDown={
                            event => {

                                if (
                                    event.key === "Enter" &&
                                    !event.shiftKey
                                ) {

                                    event.preventDefault();

                                    event.currentTarget.form?.requestSubmit();

                                }

                            }
                        }

                        placeholder="Ask about earthquake, flood, fire safety..."

                        rows={1}

                        maxLength={2000}

                        disabled={loading}

                        className="min-h-[48px] flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                    />


                    <button
                        type="submit"

                        disabled={
                            loading ||
                            !input.trim()
                        }

                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        <Send
                            size={19}
                        />

                    </button>

                </div>


                <p className="mx-auto mt-2 max-w-4xl text-xs text-slate-400">
                    AI responses are based on the disaster-management content available in the system.
                </p>

            </form>

        </div>

    );
}


export default AITutorChat;