import { api, buildUrl } from "@shared/routes";

async function fetcher<T>(
  method: string,
  path: string,
  params?: Record<string, string | number>,
  body?: any
): Promise<T> {
  const url = buildUrl(path, params);
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || "An error occurred");
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const apiClient = {
  resumes: {
    list: () => fetcher<any[]>("GET", api.resumes.list.path),
    get: (id: string) => fetcher<any>("GET", api.resumes.get.path, { id }),
    create: (data: any) => fetcher<any>("POST", api.resumes.create.path, undefined, data),
    update: (id: string, data: any) => fetcher<any>("PATCH", api.resumes.update.path, { id }, data),
    delete: (id: string) => fetcher<void>("DELETE", api.resumes.delete.path, { id }),
    duplicate: (id: string) => fetcher<any>("POST", api.resumes.duplicate.path, { id }),
  },
  jobs: {
    list: () => fetcher<any[]>("GET", api.jobs.list.path),
    create: (data: any) => fetcher<any>("POST", api.jobs.create.path, undefined, data),
    update: (id: string, data: any) => fetcher<any>("PATCH", api.jobs.update.path, { id }, data),
    delete: (id: string) => fetcher<void>("DELETE", api.jobs.delete.path, { id }),
  }
};
