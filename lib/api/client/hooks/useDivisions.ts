/* eslint-disable react-hooks/immutability */
// lib/api/client/hooks/useDivisions.ts
import { useState, useEffect } from "react";
import { divisionsAPI, CreateDivisionData, UpdateDivisionData } from "../divisions";
import { BrandDivision } from "@/lib/db/schema";

export function useDivisions(featured?: boolean) {
  const [divisions, setDivisions] = useState<BrandDivision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDivisions();
  }, [featured]);

  const loadDivisions = async () => {
    setLoading(true);
    const result = await divisionsAPI.getAll(featured);
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setDivisions(result.data);
    }
    setLoading(false);
  };

  const refresh = () => loadDivisions();

  return { divisions, loading, error, refresh };
}

export function useDivision(idOrSlug: number | string) {
  const [division, setDivision] = useState<BrandDivision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDivision();
  }, [idOrSlug]);

  const loadDivision = async () => {
    setLoading(true);
    const result = typeof idOrSlug === "number"
      ? await divisionsAPI.getById(idOrSlug)
      : await divisionsAPI.getBySlug(idOrSlug);
      
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setDivision(result.data);
    }
    setLoading(false);
  };

  const refresh = () => loadDivision();

  return { division, loading, error, refresh };
}

export function useCreateDivision() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: CreateDivisionData) => {
    setLoading(true);
    setError(null);
    const result = await divisionsAPI.create(data);
    setLoading(false);
    
    if (result.error) {
      setError(result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result.data };
  };

  return { create, loading, error };
}

export function useUpdateDivision() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: number, data: UpdateDivisionData) => {
    setLoading(true);
    setError(null);
    const result = await divisionsAPI.update(id, data);
    setLoading(false);
    
    if (result.error) {
      setError(result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result.data };
  };

  return { update, loading, error };
}

export function useDeleteDivision() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDivision = async (id: number) => {
    setLoading(true);
    setError(null);
    const result = await divisionsAPI.delete(id);
    setLoading(false);
    
    if (result.error) {
      setError(result.error);
      return { success: false, error: result.error };
    }
    
    return { success: true };
  };

  return { deleteDivision, loading, error };
}