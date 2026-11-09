import Link from 'next/link';

// Multiplayer rooms (Mission Control vs Outpost) come after single-player is solid. See docs/GAME_DESIGN.md.
export default function Lobby() {
  return (
    <main className="min-h-dvh px-6 py-14 md:px-[8vw]">
      <h1 className="text-[2.4rem] font-medium leading-tight">Rooms are not open yet</h1>
      <p className="mt-3 max-w-[50ch] text-[19px] text-bone/80">Playing together with a Mission Control seat is planned. For now, take the outpost on your own.</p>
      <Link href="/missions" className="mt-6 inline-block font-sans underline decoration-ember underline-offset-4">
        Pick a mission
      </Link>
    </main>
  );
}
