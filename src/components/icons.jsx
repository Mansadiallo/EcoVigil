/* ---------- Icônes SVG légères (inspirées lucide, sans dépendance) ---------- */
function Icon({ path, size = 20, color = "currentColor", fill = "none", strokeWidth = 2, viewBox = "0 0 24 24" }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {path}
    </svg>
  );
}

export const IconHome = (p) => <Icon {...p} path={<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></>} />;

export const IconMapPin = (p) => <Icon {...p} path={<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></>} />;

export const IconTree = (p) => <Icon {...p} path={<><path d="M12 22v-7"/><path d="M9 9a3 3 0 1 1 6 0c0 2-2 3-3 3s-3-1-3-3z"/><path d="M6 13a4 4 0 1 1 8 0c0 2.2-2 4-4 4s-4-1.8-4-4z"/><path d="M10 6a2.5 2.5 0 1 1 5 0c0 1.6-1.5 2.5-2.5 2.5S10 7.6 10 6z"/></>} />;

export const IconAlert = (p) => <Icon {...p} path={<><path d="M10.3 3.9 1.8 18a1.8 1.8 0 0 0 1.5 2.7h17.4a1.8 1.8 0 0 0 1.5-2.7L13.7 3.9a1.8 1.8 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></>} />;

export const IconCamera = (p) => <Icon {...p} path={<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>} />;

export const IconImage = (p) => <Icon {...p} path={<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></>} />;

export const IconX = (p) => <Icon {...p} path={<><path d="M18 6 6 18"/><path d="M6 6l12 12"/></>} />;

export const IconChevronLeft = (p) => <Icon {...p} path={<path d="M15 18l-6-6 6-6"/>} />;

export const IconFlame = (p) => <Icon {...p} path={<path d="M12 2c1 3-2 4-2 7a3 3 0 0 0 6 0c2 1 3 3 3 5a7 7 0 0 1-14 0c0-4 3-5 4-9 1 2 2 2 3-3z"/>} />;

export const IconDroplet = (p) => <Icon {...p} path={<path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z"/>} />;

export const IconTrash = (p) => <Icon {...p} path={<><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></>} />;

export const IconRotateCcw = (p) => <Icon {...p} path={<><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></>} />;

export const IconWind = (p) => <Icon {...p} path={<><path d="M3 8h9a3 3 0 1 0-3-3"/><path d="M3 16h13a3 3 0 1 1-3 3"/><path d="M3 12h16a3 3 0 1 0-3-3"/></>} />;

export const IconWaves = (p) => <Icon {...p} path={<><path d="M2 8c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0"/><path d="M2 15c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0 3.5 2 5 0"/></>} />;

export const IconFlask = (p) => <Icon {...p} path={<><path d="M9 2v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-11V2"/><path d="M8.5 2h7"/><path d="M6.5 15h11"/></>} />;

export const IconGlassWater = (p) => <Icon {...p} path={<><path d="M6 3h12l-1.2 16.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8z"/><path d="M6.6 11h10.8"/></>} />;

export const IconNewspaper = (p) => <Icon {...p} path={<><path d="M4 4h13a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2z"/><path d="M19 4a2 2 0 0 1 2 2v11a1 1 0 0 1-1 1"/><path d="M8 8h6"/><path d="M8 12h6"/><path d="M8 16h4"/></>} />;

export const IconUsers = (p) => <Icon {...p} path={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />;

export const IconDownload = (p) => <Icon {...p} path={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></>} />;

export const IconPaw = (p) => <Icon {...p} path={<><circle cx="4.5" cy="9" r="2"/><circle cx="9" cy="5.5" r="2"/><circle cx="15" cy="5.5" r="2"/><circle cx="19.5" cy="9" r="2"/><path d="M6 20c-1.5 0-3-1.2-3-3 0-2.5 3-4 3-6.5 0 0 3-1.5 6-1.5s6 1.5 6 1.5c0 2.5 3 4 3 6.5 0 1.8-1.5 3-3 3-2 0-2.5-1.5-6-1.5s-4 1.5-6 1.5z"/></>} />;

export const IconCloudRain = (p) => <Icon {...p} path={<><path d="M16 13a4 4 0 0 0-2-7.4A6 6 0 0 0 3 8.5 4.5 4.5 0 0 0 4.5 17H16a3.5 3.5 0 0 0 0-7z"/><path d="M8 19l-1 2"/><path d="M12 19l-1 2"/><path d="M16 19l-1 2"/></>} />;

export const IconSun = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.9 4.9l1.4 1.4"/><path d="M17.7 17.7l1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.9 19.1l1.4-1.4"/><path d="M17.7 6.3l1.4-1.4"/></>} />;

export const IconMaximize = (p) => <Icon {...p} path={<><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></>} />;

export const IconMinimize = (p) => <Icon {...p} path={<><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></>} />;

export const IconLayers = (p) => <Icon {...p} path={<><path d="M12 2 2 7l10 5 10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>} />;

export const IconClock = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></>} />;

export const IconSparkles = (p) => <Icon {...p} path={<><path d="M12 3v4"/><path d="M12 17v4"/><path d="M3 12h4"/><path d="M17 12h4"/><path d="M5.6 5.6l2.8 2.8"/><path d="M15.6 15.6l2.8 2.8"/><path d="M18.4 5.6l-2.8 2.8"/><path d="M8.4 15.6l-2.8 2.8"/></>} />;

export const IconMenu = (p) => <Icon {...p} path={<><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>} />;

export const IconMoon = (p) => <Icon {...p} path={<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>} />;

export const IconMonitor = (p) => <Icon {...p} path={<><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></>} />;

export const IconCalendar = (p) => <Icon {...p} path={<><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></>} />;

export const IconUserCircle = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M6.5 19a5.5 5.5 0 0 1 11 0"/></>} />;

export const IconMailPlus = (p) => <Icon {...p} path={<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></>} />;

export const IconArrowLeft = (p) => <Icon {...p} path={<><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></>} />;

export const IconGlobe = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></>} />;

export const IconEye = (p) => <Icon {...p} path={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>} />;

export const IconEyeOff = (p) => <Icon {...p} path={<><path d="M17.9 17.9A10.4 10.4 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.1-5.9"/><path d="M9.9 4.2A9.7 9.7 0 0 1 12 4c7 0 11 8 11 8a18.4 18.4 0 0 1-2.3 3.3"/><path d="M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="M1 1l22 22"/></>} />;

export const IconEdit = (p) => <Icon {...p} path={<><path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></>} />;

export const IconInfo = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>} />;

export const IconSend = (p) => <Icon {...p} path={<><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/></>} />;

export const IconPick = (p) => <Icon {...p} path={<><path d="M14.5 3 21 9.5"/><path d="M3 21l7-1 8-8-6-6-8 8z"/></>} />;

export const IconFish = (p) => <Icon {...p} path={<><path d="M2 12s4-6 12-6 8 6 8 6-3 6-8 6-12-6-12-6z"/><circle cx="16" cy="11" r=".6"/></>} />;

export const IconPlus = (p) => <Icon {...p} path={<><path d="M12 5v14"/><path d="M5 12h14"/></>} />;

export const IconCheck = (p) => <Icon {...p} path={<path d="M20 6 9 17l-5-5"/>} />;

export const IconSprout = (p) => <Icon {...p} path={<><path d="M7 20h10"/><path d="M12 20V10"/><path d="M12 10C10 10 8 8 8 5c3 0 5 2 5 5"/><path d="M12 8c1.5 0 3-1.2 3-3.5C13 4.5 12 6 12 8z"/></>} />;

export const IconShare = (p) => <Icon {...p} path={<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 3.9"/><path d="M15.4 6.6L8.6 10.5"/></>} />;

export const IconBell = (p) => <Icon {...p} path={<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>} />;

export const IconWifiOff = (p) => <Icon {...p} path={<><path d="M1 1l22 22"/><path d="M16.7 16.7a10 10 0 0 0-9.4 0"/><path d="M5 12.9a15 15 0 0 1 4-2.5"/><path d="M12 20h.01"/><path d="M19.1 12.9A15 15 0 0 0 15 10.4"/></>} />;

export const IconWifi = (p) => <Icon {...p} path={<><path d="M5 12.9a15 15 0 0 1 14 0"/><path d="M8.5 16.4a10 10 0 0 1 7 0"/><path d="M2 8.8a20 20 0 0 1 20 0"/><path d="M12 20h.01"/></>} />;

export const IconSearch = (p) => <Icon {...p} path={<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></>} />;

export const IconRoute = (p) => <Icon {...p} path={<><circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="18" r="2.5"/><path d="M7.2 7.2C10 10 8 14 12 15s4 3 6.6 3"/></>} />;

export const IconPlay = (p) => <Icon {...p} path={<path d="M6 4l14 8-14 8V4z"/>} fill="currentColor" />;

export const IconSquareStop = (p) => <Icon {...p} path={<><rect x="4" y="4" width="16" height="16" rx="2"/></>} fill="currentColor" />;

export const IconCloudDownload = (p) => <Icon {...p} path={<><path d="M17.5 19a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6-1.7A4.5 4.5 0 0 0 6.5 19h11z"/><path d="M12 10v7"/><path d="M9 14l3 3 3-3"/></>} />;

export const IconGauge = (p) => <Icon {...p} path={<><path d="M12 14l3-4"/><circle cx="12" cy="14" r="1.5"/><path d="M4.9 19a9 9 0 1 1 14.2 0"/></>} />;

export const IconLock = (p) => <Icon {...p} path={<><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></>} />;

export const IconShield = (p) => <Icon {...p} path={<path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5z"/>} />;

export const IconLogOut = (p) => <Icon {...p} path={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></>} />;

export const IconTarget = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></>} />;

export const IconTrendingUp = (p) => <Icon {...p} path={<><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></>} />;
