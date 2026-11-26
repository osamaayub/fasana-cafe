type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24", "aria-hidden": true };

export const Coffee = ({ className }: P) => (<svg {...base} className={className}><path d="M4 8h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6V8Z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17"/><path d="M8 2v2M12 2v2"/></svg>);
export const Book = ({ className }: P) => (<svg {...base} className={className}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M4 19a2 2 0 0 1 2-2h13"/></svg>);
export const Leaf = ({ className }: P) => (<svg {...base} className={className}><path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19 13 11"/></svg>);
export const Star = ({ className }: P) => (<svg {...base} className={className}><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/></svg>);
export const Phone = ({ className }: P) => (<svg {...base} className={className}><path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 7 7L16 14l5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg>);
export const Pin = ({ className }: P) => (<svg {...base} className={className}><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>);
export const Clock = ({ className }: P) => (<svg {...base} className={className}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
export const Chat = ({ className }: P) => (<svg {...base} className={className}><path d="M4 20l1.5-4A8 8 0 1 1 9 19.5L4 20Z"/></svg>);
export const Menu = ({ className }: P) => (<svg {...base} className={className}><path d="M4 7h16M4 12h16M4 17h16"/></svg>);
export const X = ({ className }: P) => (<svg {...base} className={className}><path d="M6 6l12 12M18 6 6 18"/></svg>);
export const Arrow = ({ className }: P) => (<svg {...base} className={className}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
export const Search = ({ className }: P) => (<svg {...base} className={className}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>);

export const iconFor = (name: string) => ({ coffee: Coffee, book: Book, leaf: Leaf, star: Star })[name] ?? Coffee;
