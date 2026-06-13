import { redirect } from 'next/navigation';

export default function LegacyApiDocPage() {
  redirect('/docs/api');
}
