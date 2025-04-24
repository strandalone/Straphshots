export function Button({ className = "", children, ...props }) {
  return <button className={`bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition ${className}`} {...props}>{children}</button>;
}
