/**
 * Site-wide footer with the legal/fan-tool disclaimer. Renders below the routed
 * page content. Designed to be terse so it doesn't crowd the wizard, but explicit
 * enough to make the project's status clear.
 */
export function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-gray-50 px-6 py-6 text-xs text-gray-600 print:hidden">
      <div className="mx-auto max-w-4xl space-y-2 leading-relaxed">
        <p>
          <strong>Unofficial fan tool.</strong> This is a non-commercial, community-built
          character generator for the Traveller roleplaying game. It is not affiliated with,
          endorsed by, or sponsored by Mongoose Publishing, Far Future Enterprises, or any
          official Traveller licensee.
        </p>
        <p>
          Traveller and the Traveller trademarks are property of Far Future Enterprises and
          are used here under fair use for non-commercial reference. Game mechanics
          referenced by this tool come from{' '}
          <a
            href="https://www.mongoosepublishing.com/collections/traveller"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-900"
          >
            the Mongoose Traveller 2022 Core Rulebook
          </a>
          ; no rulebook text or art is reproduced beyond what is needed to drive the
          generator. If you intend to actually play, please purchase the book — this tool
          is a planning aid, not a substitute.
        </p>
        <p>
          No warranty. Use at your own risk. Found a bug or rules-correctness issue?{' '}
          <a
            href="https://github.com/BytesByNelson/traveller-lifepath/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-900"
          >
            Open an issue
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
