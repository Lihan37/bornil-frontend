export default function ErrorState({ message = 'Something went wrong.' }: { message?: string }) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
      {message}
    </div>
  );
}
