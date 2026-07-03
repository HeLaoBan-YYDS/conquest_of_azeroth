type NavigationItem = {
  key: string;
  path: string;
  isContentType?: boolean;
};

export const NAVIGATION_CONFIG: NavigationItem[] = [
  {
    path: "/guide",
    key: "guide",
    isContentType: true,
  },
  {
    path: "/release",
    key: "release",
    isContentType: true,
  },
  {
    path: "/access",
    key: "access",
    isContentType: true,
  },
  {
    path: "/classes",
    key: "classes",
    isContentType: true,
  },
  {
    path: "/builds",
    key: "builds",
    isContentType: true,
  },
  {
    path: "/rankings",
    key: "rankings",
    isContentType: true,
  },
  {
    path: "/addons",
    key: "addons",
    isContentType: true,
  },
  {
    path: "/community",
    key: "community",
    isContentType: true,
  },
];

export const CONTENT_TYPES: string[] = NAVIGATION_CONFIG
  .filter((item) => item.isContentType)
  .map((item) => item.key);
