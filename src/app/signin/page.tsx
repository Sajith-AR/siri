export default function SignInPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h2 className="text-2xl font-semibold">Sign in</h2>
      <form className="mt-6 space-y-4">
        <div className="space-y-1">
          <label className="text-sm">Email</label>
          <input type="email" className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <input type="password" className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm" />
        </div>
        <button className="w-full rounded-md bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90">Continue</button>
      </form>
    </div>
  );
}


