import { sql } from './db.js'

export async function initSchema() {
  await sql`
    create table if not exists campaigns (
      id text primary key,
      user_id text not null,
      name text not null,
      objective text not null,
      location text not null,
      budget_type text not null,
      budget_amount numeric not null default 0,
      start_at timestamptz not null,
      end_at timestamptz,
      status text not null default 'Serving',
      connector_type text not null,
      connector_category text not null,
      selected_connectors jsonb not null default '[]'::jsonb,
      created_at timestamptz not null default now()
    )
  `

  await sql`
    create table if not exists ads (
      id text primary key,
      campaign_id text not null references campaigns(id) on delete cascade,
      ad_group_name text not null,
      max_cpc_bid numeric not null default 0,
      destination_url text not null,
      display_url text not null,
      context_hints text not null default '',
      headline text not null,
      description text not null,
      cta text not null default '',
      logo_url text not null default '',
      banner_url text not null default '',
      created_at timestamptz not null default now()
    )
  `

  await sql`
    create table if not exists ad_keywords (
      id text primary key,
      ad_id text not null references ads(id) on delete cascade,
      keyword text not null,
      created_at timestamptz not null default now()
    )
  `

  await sql`
    create table if not exists ad_events (
      id text primary key,
      ad_id text not null references ads(id) on delete cascade,
      event_type text not null check (event_type in ('impression', 'click')),
      search_query text not null default '',
      created_at timestamptz not null default now()
    )
  `
}
