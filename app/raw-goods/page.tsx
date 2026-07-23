import { createClient } from '@/lib/supabase/server';
import type { RawGood } from '@/lib/types/database';
import { RawGoodsClient } from './raw-goods-client';

export default async function RawGoodsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('raw_goods')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<RawGood[]>();

  return <RawGoodsClient initialRawGoods={data ?? []} />;
}
