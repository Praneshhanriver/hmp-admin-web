// The props this component accepts, like a constructor's parameter list
interface AppTopBarProps {
  accountEmail: string;
}

// Top bar on every admin screen. Spec: account + log out, no role switch
export default function AppTopBar({ accountEmail }: AppTopBarProps) {
  return (
    <header className="app-topbar">
      <span className="app-topbar-title">HMP Administration</span>
      <div className="app-topbar-account">
        <span>{accountEmail}</span>
        <button type="button">Log out</button>
      </div>
    </header>
  );
}