export const isDev = process.env.NEXT_PUBLIC_APP_ENV === "development";
export const isProd = process.env.NEXT_PUBLIC_APP_ENV === "production";

export const universalEnv = isProd
  ? {
      basePath: "/marketing/esim",
      wwwDomain: "https://tourvis.com",
      apiBaseUrls: {
        common_fe: "https://edge.tourvis.com/tvcomm/fe",
      },
    }
  : {
      basePath: "/marketing/esim",
      wwwDomain: "https://d.tourvis.com",
      apiBaseUrls: {
        common_fe: "https://dedge.tourvis.com/tvcomm/fe",
      },
    };
