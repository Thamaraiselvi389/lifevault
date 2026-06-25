import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export function useSupabaseQuery<T>(
  table: string,
  select = '*',
  orderBy?: { column: string; ascending?: boolean },
) {
  const { user } = useAuth()
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!user) {
      setData([])
      setLoading(false)
      return
    }
    setLoading(true)
    let query = supabase.from(table).select(select).eq('user_id', user.id)
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false })
    }
    const { data: rows, error: err } = await query
    if (err) {
      setError(err.message)
      toast.error(`Failed to load ${table}`)
    } else {
      setData((rows as T[]) ?? [])
      setError(null)
    }
    setLoading(false)
  }, [user, table, select, orderBy?.column, orderBy?.ascending])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch, setData }
}

export function useSupabaseMutation(table: string) {
  const { user } = useAuth()

  const insert = async (row: Record<string, unknown>) => {
    if (!user) return { error: 'Not authenticated' }
    const { data, error } = await supabase
      .from(table)
      .insert({ ...row, user_id: user.id } as never)
      .select()
      .single()
    if (error) toast.error(error.message)
    return { data, error: error?.message ?? null }
  }

  const update = async (id: string, row: Record<string, unknown>) => {
    const { data, error } = await supabase
      .from(table)
      .update(row as never)
      .eq('id', id)
      .select()
      .single()
    if (error) toast.error(error.message)
    return { data, error: error?.message ?? null }
  }

  const remove = async (id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) toast.error(error.message)
    return { error: error?.message ?? null }
  }

  return { insert, update, remove }
}
