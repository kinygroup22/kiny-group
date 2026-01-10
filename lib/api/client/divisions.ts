// lib/api/client/divisions.ts
import { BrandDivision, BrandActivity } from "@/lib/db/schema";

export interface CreateDivisionData {
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  fullDescription: string;
  coverage?: string;
  delivery?: string;
  backgroundImage?: string;
  logo?: string;
  color?: string;
  stats?: {
    label1: string;
    value1: string;
    label2: string;
    value2: string;
    label3: string;
    value3: string;
    label4: string;
    value4: string;
  };
  services?: Array<{
    name: string;
    description: string;
  }>;
  achievements?: string[];
  team?: Array<{
    name: string;
    position: string;
  }>;
  theme?: {
    primary: string;
    bg: string;
    bgSolid: string;
    border: string;
    text: string;
    accent: string;
    hover: string;
    gradient: string;
  };
  featured?: boolean;
}

export type UpdateDivisionData = Partial<CreateDivisionData>;

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class DivisionsAPI {
  private baseUrl = "/api/divisions";

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "An error occurred" }));
      return { error: error.error || `Error: ${response.status}` };
    }
    const data = await response.json();
    return { data };
  }

  /**
   * Get all divisions
   * @param featured - Optional filter for featured divisions only
   */
  async getAll(featured?: boolean): Promise<ApiResponse<BrandDivision[]>> {
    try {
      const url = featured 
        ? `${this.baseUrl}?featured=true` 
        : this.baseUrl;
      const response = await fetch(url);
      return this.handleResponse<BrandDivision[]>(response);
    } catch (error) {
      return { error: "Failed to fetch divisions" };
    }
  }

  /**
   * Get a single division by ID
   */
  async getById(id: number): Promise<ApiResponse<BrandDivision>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      return this.handleResponse<BrandDivision>(response);
    } catch (error) {
      return { error: "Failed to fetch division" };
    }
  }

  /**
   * Get a single division by slug
   */
  async getBySlug(slug: string): Promise<ApiResponse<BrandDivision>> {
    try {
      const response = await fetch(`${this.baseUrl}/slug/${slug}`);
      return this.handleResponse<BrandDivision>(response);
    } catch (error) {
      return { error: "Failed to fetch division" };
    }
  }

  /**
   * Create a new division
   */
  async create(data: CreateDivisionData): Promise<ApiResponse<BrandDivision>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return this.handleResponse<BrandDivision>(response);
    } catch (error) {
      return { error: "Failed to create division" };
    }
  }

  /**
   * Update an existing division
   */
  async update(
    id: number,
    data: UpdateDivisionData
  ): Promise<ApiResponse<BrandDivision>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return this.handleResponse<BrandDivision>(response);
    } catch (error) {
      return { error: "Failed to update division" };
    }
  }

  /**
   * Delete a division
   */
  async delete(id: number): Promise<ApiResponse<{ success: boolean; message: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
      });
      return this.handleResponse<{ success: boolean; message: string }>(response);
    } catch (error) {
      return { error: "Failed to delete division" };
    }
  }

  /**
   * Toggle featured status of a division
   */
  async toggleFeatured(id: number): Promise<ApiResponse<BrandDivision>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/toggle-featured`, {
        method: "PATCH",
      });
      return this.handleResponse<BrandDivision>(response);
    } catch (error) {
      return { error: "Failed to toggle featured status" };
    }
  }

  /**
   * Validate if a slug is available
   */
  async validateSlug(
    slug: string,
    currentId?: number
  ): Promise<ApiResponse<{ available: boolean; error?: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/validate-slug`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, currentId }),
      });
      return this.handleResponse<{ available: boolean; error?: string }>(response);
    } catch (error) {
      return { error: "Failed to validate slug" };
    }
  }

  /**
   * Generate a slug from a name
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  }

  // ACTIVITY MANAGEMENT FUNCTIONS
  
  /**
   * Get all activities for a division
   */
  async getActivities(divisionId: number): Promise<BrandActivity[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${divisionId}/activities`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch activities");
      }
      return response.json();
    } catch (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }
  }

  /**
   * Create a new activity for a division
   */
  async createActivity(
    divisionId: number, 
    data: { title: string; description: string; imageUrl: string }
  ): Promise<ApiResponse<BrandActivity>> {
    try {
      const response = await fetch(`${this.baseUrl}/${divisionId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return this.handleResponse<BrandActivity>(response);
    } catch (error) {
      return { error: "Failed to create activity" };
    }
  }

  /**
   * Update an existing activity
   */
  async updateActivity(
    activityId: number, 
    data: Partial<BrandActivity>
  ): Promise<ApiResponse<BrandActivity>> {
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return this.handleResponse<BrandActivity>(response);
    } catch (error) {
      return { error: "Failed to update activity" };
    }
  }

  /**
   * Delete an activity
   */
  async deleteActivity(activityId: number): Promise<void> {
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete activity");
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
  }

  /**
   * Reorder activities for a division
   */
  async reorderActivities(divisionId: number, activityIds: number[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${divisionId}/activities`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityIds }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reorder activities");
      }
    } catch (error) {
      console.error("Error reordering activities:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const divisionsAPI = new DivisionsAPI();

// React hooks for using the API
export { useDivisions, useDivision, useCreateDivision, useUpdateDivision, useDeleteDivision } from "./hooks/useDivisions";