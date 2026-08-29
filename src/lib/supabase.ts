import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const emptyResult = <T>(data: T | null = null) => ({ data, error: null });

function createNoopQuery<T = null>() {
  const query = Promise.resolve(emptyResult<T>());
  const chain = {
    select: () => chain,
    order: () => chain,
    limit: () => chain,
    eq: () => chain,
    gt: () => chain,
    gte: () => chain,
    lt: () => chain,
    lte: () => chain,
    in: () => chain,
    like: () => chain,
    ilike: () => chain,
    contains: () => chain,
    overlaps: () => chain,
    filter: () => chain,
    maybeSingle: async () => emptyResult<T>(),
    single: async () => emptyResult<T>(),
    insert: async () => emptyResult<T>(),
    update: async () => emptyResult<T>(),
    delete: async () => emptyResult<T>(),
    then: query.then.bind(query),
    catch: query.catch.bind(query),
    finally: query.finally.bind(query),
  };

  return Object.assign(query, chain);
}

const fallbackAuth = {
  getSession: async () => ({ data: { session: null }, error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } }, error: null }),
  signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
  signOut: async () => ({ error: null }),
};

const fallbackStorage = {
  from: () => ({
    upload: async () => emptyResult({ path: '' }),
    getPublicUrl: () => ({ data: { publicUrl: '' } }),
  }),
};

const fallbackClient = {
  auth: fallbackAuth,
  from: () => createNoopQuery(),
  storage: fallbackStorage,
} as any;

if (!isSupabaseConfigured) {
  console.warn('Supabase environment variables are missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable database features.');
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : fallbackClient;
