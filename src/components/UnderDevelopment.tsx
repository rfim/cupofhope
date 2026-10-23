export default function UnderDevelopment({ text }: { text: string }) {
  const [first, ...rest] = text.split(". ");
  return (
    <section className="bg-lines flex min-h-[100svh] items-center justify-center bg-[#0b0b0b] px-6 text-center">
      <h1 className="text-3xl font-semibold leading-tight text-white md:text-6xl">
        {first}.<br />{rest.join(". ")}
      </h1>
    </section>
  );
}
