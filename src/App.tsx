import React, { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, Clock, Wallet, Plus, Car, Train, ArrowLeft, 
  Edit2, Trash2, Heart, PlaneTakeoff, Download, Bus, Plane, 
  Utensils, Navigation, ArrowRight, User, Users, CheckCircle2,
  Link as LinkIcon, Copy, X
} from 'lucide-react';

// --- Firebase Realtime Database Imports ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'couple-trip-planner';

// --- Static Data for Stations ---
const STATION_DATA = {
  "BTS (สายสีเขียว/สีทอง)": [
    "CEN สยาม", "N1 ราชเทวี", "N2 พญาไท", "N3 อนุสาวรีย์ชัยสมรภูมิ", "N4 สนามเป้า", "N5 อารีย์", "N7 สะพานควาย", "N8 หมอชิต", 
    "N9 ห้าแยกลาดพร้าว", "N10 พหลโยธิน 24", "N11 รัชโยธิน", "N12 เสนานิคม", "N13 มหาวิทยาลัยเกษตรศาสตร์", "N14 กรมป่าไม้", 
    "N15 บางบัว", "N16 กรมทหารราบที่ 11", "N17 วัดพระศรีมหาธาตุ", "N18 พหลโยธิน 59", "N19 สายหยุด", "N20 สะพานใหม่", 
    "N21 โรงพยาบาลภูมิพลอดุลยเดช", "N22 พิพิธภัณฑ์กองทัพอากาศ", "N23 แยก คปอ.", "N24 คูคต", 
    "E1 ชิดลม", "E2 เพลินจิต", "E3 นานา", "E4 อโศก", "E5 พร้อมพงษ์", "E6 ทองหล่อ", "E7 เอกมัย", "E8 พระโขนง", "E9 อ่อนนุช", 
    "E10 บางจาก", "E11 ปุณณวิถี", "E12 อุดมสุข", "E13 บางนา", "E14 แบริ่ง", "E15 สำโรง", "E16 ปู่เจ้า", "E17 ช้างเอราวัณ", 
    "E18 โรงเรียนนายเรือ", "E19 ปากน้ำ", "E20 ศรีนครินทร์", "E21 แพรกษา", "E22 สายลวด", "E23 เคหะฯ",
    "W1 สนามกีฬาแห่งชาติ", 
    "S1 ราชดำริ", "S2 ศาลาแดง", "S3 ช่องนนทรี", "S4 เซนต์หลุยส์", "S5 สุรศักดิ์", "S6 สะพานตากสิน", "S7 กรุงธนบุรี", 
    "S8 วงเวียนใหญ่", "S9 โพธิ์นิมิตร", "S10 ตลาดพลู", "S11 วุฒากาศ", "S12 บางหว้า",
    "G1 กรุงธนบุรี (สีทอง)", "G2 เจริญนคร (สีทอง)", "G3 คลองสาน (สีทอง)"
  ],
  "MRT (สายสีน้ำเงิน/สีม่วง)": [
    "BL01 ท่าพระ", "BL02 จรัญฯ 13", "BL03 ไฟฉาย", "BL04 บางขุนนนท์", "BL05 บางยี่ขัน", "BL06 สิรินธร", "BL07 บางพลัด", 
    "BL08 บางอ้อ", "BL09 บางโพ", "BL10 เตาปูน", "BL11 บางซื่อ", "BL12 กำแพงเพชร", "BL13 สวนจตุจักร", "BL14 พหลโยธิน", 
    "BL15 ลาดพร้าว", "BL16 รัชดาภิเษก", "BL17 สุทธิสาร", "BL18 ห้วยขวาง", "BL19 ศูนย์วัฒนธรรมแห่งประเทศไทย", "BL20 พระราม 9", 
    "BL21 เพชรบุรี", "BL22 สุขุมวิท", "BL23 ศูนย์การประชุมแห่งชาติสิริกิติ์", "BL24 คลองเตย", "BL25 ลุมพินี", "BL26 สีลม", 
    "BL27 สามย่าน", "BL28 หัวลำโพง", "BL29 วัดมังกร", "BL30 สามยอด", "BL31 สนามไชย", "BL32 อิสรภาพ", "BL33 ท่าพระ (Interchange)", 
    "BL34 บางไผ่", "BL35 บางหว้า", "BL36 เพชรเกษม 48", "BL37 ภาษีเจริญ", "BL38 หลักสอง",
    "PP01 คลองบางไผ่", "PP02 ตลาดบางใหญ่", "PP03 สามแยกบางใหญ่", "PP04 บางพลู", "PP05 บางรักใหญ่", "PP06 บางรักน้อยท่าอิฐ", 
    "PP07 ไทรม้า", "PP08 สะพานพระนั่งเกล้า", "PP09 แยกนนทบุรี 1", "PP10 บางกระสอ", "PP11 ศูนย์ราชการนนทบุรี", "PP12 กระทรวงสาธารณสุข", 
    "PP13 แยกติวานนท์", "PP14 วงศ์สว่าง", "PP15 บางซ่อน", "PP16 เตาปูน"
  ],
  "สายสีเหลือง (Yellow Line)": [
    "YL01 ลาดพร้าว", "YL02 ภาวนา", "YL03 โชคชัย 4", "YL04 ลาดพร้าว 71", "YL05 ลาดพร้าว 83", "YL06 มหาดไทย", "YL07 ลาดพร้าว 101", 
    "YL08 บางกะปิ", "YL09 แยกลำสาลี", "YL10 ศรีกรีฑา", "YL11 หัวหมาก", "YL12 กลันตัน", "YL13 ศรีนุช", "YL14 ศรีนครินทร์ 38", 
    "YL15 สวนหลวง ร.9", "YL16 ศรีอุดม", "YL17 ศรีเอี่ยม", "YL18 ศรีลาซาล", "YL19 ศรีแบริ่ง", "YL20 ศรีด่าน", "YL21 ศรีเทพา", 
    "YL22 ทิพวัล", "YL23 สำโรง"
  ],
  "สายสีชมพู (Pink Line)": [
    "PK01 ศูนย์ราชการนนทบุรี", "PK02 แคราย", "PK03 สนามบินน้ำ", "PK04 สามัคคี", "PK05 กรมชลประทาน", "PK06 แยกปากเกร็ด", 
    "PK07 เลี่ยงเมืองปากเกร็ด", "PK08 แจ้งวัฒนะ-ปากเกร็ด 28", "PK09 ศรีรัช", "PK10 เมืองทองธานี", "PK11 แจ้งวัฒนะ 14", 
    "PK12 ศูนย์ราชการเฉลิมพระเกียรติ", "PK13 โทรคมนาคมแห่งชาติ", "PK14 หลักสี่", "PK15 ราชภัฏพระนคร", "PK16 วัดพระศรีมหาธาตุ", 
    "PK17 รามอินทรา 3", "PK18 ลาดปลาเค้า", "PK19 รามอินทรา กม.4", "PK20 มัยลาภ", "PK21 วัชรพล", "PK22 รามอินทรา กม.6", 
    "PK23 คู้บอน", "PK24 รามอินทรา กม.9", "PK25 วงแหวนรามอินทรา", "PK26 นพรัตน์", "PK27 บางชัน", "PK28 เศรษฐบุตรบำเพ็ญ", 
    "PK29 ตลาดมีนบุรี", "PK30 มีนบุรี"
  ],
  "SRT (สายสีแดง)": [
    "RN01 กรุงเทพอภิวัฒน์ (บางซื่อ)", "RN02 จตุจักร", "RN03 วัดเสมียนนารี", "RN04 บางเขน", "RN05 ทุ่งสองห้อง", "RN06 หลักสี่", 
    "RN07 การเคหะ", "RN08 ดอนเมือง", "RN09 หลักหก", "RN10 รังสิต",
    "RW01 กรุงเทพอภิวัฒน์ (บางซื่อ)", "RW02 บางซ่อน", "RW05 บางบำหรุ", "RW06 ตลิ่งชัน"
  ],
  "ARL (แอร์พอร์ตเรลลิงก์)": [
    "A1 สุวรรณภูมิ", "A2 ลาดกระบัง", "A3 บ้านทับช้าง", "A4 หัวหมาก", "A5 รามคำแหง", "A6 มักกะสัน", "A7 ราชปรารภ", "A8 พญาไท"
  ]
};

export default function App() {
  // --- Auth & Sync States ---
  const [user, setUser] = useState(null);
  const [coupleCode, setCoupleCode] = useState(''); // รหัสสำหรับดึงข้อมูล
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  
  // --- App States ---
  const [trips, setTrips] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTripId, setSelectedTripId] = useState(null);
  
  // --- Modal States ---
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isSubItemModalOpen, setIsSubItemModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // --- Tab States ---
  const [tripFormTab, setTripFormTab] = useState('outbound');
  const [activeTabDate, setActiveTabDate] = useState('');

  // --- Form States ---
  const [tripForm, setTripForm] = useState({ 
    id: null, name: '', startDate: '', endDate: '', departureTime: '', returnTime: '',
    transport: {
      outbound: { type: 'none', busBoarding: '', busPlatform: '', trainNumber: '', trainBogie: '', trainPlatform: '', flightAirline: '', flightNumber: '', flightGate: '', myCost: '', partnerCost: '' },
      return: { type: 'none', busBoarding: '', busPlatform: '', trainNumber: '', trainBogie: '', trainPlatform: '', flightAirline: '', flightNumber: '', flightGate: '', myCost: '', partnerCost: '' }
    }
  });

  const [itemForm, setItemForm] = useState({ 
    id: null, name: '', transportMode: 'public', 
    myCost: '', partnerCost: '',
    publicOriginSystem: '', publicOriginStation: '',
    publicDestSystem: '', publicDestStation: '',
    grabPickup: '', date: ''
  });

  const [subItemForm, setSubItemForm] = useState({ parentId: null, id: null, name: '', myCost: '', partnerCost: '' });

  // --- 1. Initialize Firebase Auth ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // หากไม่มีรหัสเชื่อมต่อตั้งไว้ ให้ใช้รหัสส่วนตัว (UID) ของตัวเองเป็นค่าเริ่มต้น
        if (!coupleCode) {
          setCoupleCode(currentUser.uid);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 2. Realtime Data Sync ---
  useEffect(() => {
    if (!user || !coupleCode) return;

    // ชี้เป้าหมายไปที่ฐานข้อมูลหลัก (Public Data -> coupleTrips)
    const tripsRef = collection(db, 'artifacts', appId, 'public', 'data', 'coupleTrips');
    
    // onSnapshot คือความลับของการ "พิมพ์ปุ๊บ เด้งปั๊บ"
    const unsubscribe = onSnapshot(tripsRef, (snapshot) => {
      const allTrips = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      // ดึงเฉพาะทริปที่มี รหัสคู่รัก ตรงกับที่เราตั้งไว้
      const myTrips = allTrips.filter(t => t.coupleCode === coupleCode);
      // เรียงทริปตามวันที่
      myTrips.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      
      setTrips(myTrips);
    }, (error) => {
      console.error("Sync Error:", error);
    });

    return () => unsubscribe();
  }, [user, coupleCode]);

  useEffect(() => {
    const trip = trips.find(t => t.id === selectedTripId);
    if (trip && trip.startDate && !activeTabDate) {
      setActiveTabDate(trip.startDate);
    }
  }, [selectedTripId, trips]);

  // --- Data Base Operations ---
  const saveTripToCloud = async (tripData) => {
    if (!user || !coupleCode) return;
    try {
      const tripId = tripData.id || Date.now().toString();
      const payload = { ...tripData, id: tripId, coupleCode: coupleCode };
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'coupleTrips', tripId), payload);
    } catch (err) {
      console.error("Save Error:", err);
    }
  };

  const deleteTripFromCloud = async (tripId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'coupleTrips', tripId));
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  // --- Handlers ---
  const handleSaveTrip = (e) => {
    e.preventDefault();
    const newTrip = { ...tripForm, itinerary: tripForm.itinerary || [] };
    saveTripToCloud(newTrip);
    setIsTripModalOpen(false);
  };

  const handleDeleteTrip = (id, e) => {
    e.stopPropagation();
    if(window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบทริปนี้? ระบบจะลบออกจากเครื่องของแฟนด้วยนะ')) {
      deleteTripFromCloud(id);
      if (selectedTripId === id) setCurrentView('dashboard');
    }
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    const trip = trips.find(t => t.id === selectedTripId);
    if (!trip) return;

    let newItinerary = [...(trip.itinerary || [])];
    if (itemForm.id) {
      newItinerary = newItinerary.map(item => item.id === itemForm.id ? { ...item, ...itemForm } : item);
    } else {
      newItinerary.push({ ...itemForm, id: Date.now().toString(), subItems: [] });
    }
    
    saveTripToCloud({ ...trip, itinerary: newItinerary });
    setIsItemModalOpen(false);
  };

  const handleDeleteItem = (itemId) => {
    if(window.confirm('ลบรายการนี้ใช่ไหม?')) {
      const trip = trips.find(t => t.id === selectedTripId);
      if (!trip) return;
      saveTripToCloud({ ...trip, itinerary: trip.itinerary.filter(i => i.id !== itemId) });
    }
  };

  const handleSaveSubItem = (e) => {
    e.preventDefault();
    const trip = trips.find(t => t.id === selectedTripId);
    if (!trip) return;

    const newItinerary = trip.itinerary.map(item => {
      if (item.id === subItemForm.parentId) {
         const newSubItems = [...(item.subItems || [])];
         if (subItemForm.id) {
           return { ...item, subItems: newSubItems.map(si => si.id === subItemForm.id ? subItemForm : si) };
         } else {
           newSubItems.push({ ...subItemForm, id: Date.now().toString() });
           return { ...item, subItems: newSubItems };
         }
      }
      return item;
    });

    saveTripToCloud({ ...trip, itinerary: newItinerary });
    setIsSubItemModalOpen(false);
  };

  const handleDeleteSubItem = (itemId, subItemId) => {
    if(window.confirm('ลบกิจกรรมย่อยนี้ใช่ไหม?')) {
      const trip = trips.find(t => t.id === selectedTripId);
      if (!trip) return;
      
      const newItinerary = trip.itinerary.map(item => {
        if (item.id === itemId) {
          return { ...item, subItems: item.subItems.filter(si => si.id !== subItemId) };
        }
        return item;
      });

      saveTripToCloud({ ...trip, itinerary: newItinerary });
    }
  };

  const handleLinkPartner = (e) => {
    e.preventDefault();
    if (partnerCodeInput.trim() !== '') {
      setCoupleCode(partnerCodeInput.trim());
      setIsShareModalOpen(false);
      setCurrentView('dashboard');
    }
  };

  const copyToClipboard = (text) => {
    try {
      document.execCommand('copy'); // Fallback for iFrame
      navigator.clipboard.writeText(text);
      // Small visual feedback could go here
    } catch (err) {
      console.error(err);
    }
  };

  // --- Form Resets ---
  const resetTripForm = () => {
    setTripFormTab('outbound');
    setTripForm({ 
      id: null, name: '', startDate: '', endDate: '', departureTime: '', returnTime: '',
      transport: {
        outbound: { type: 'none', busBoarding: '', busPlatform: '', trainNumber: '', trainBogie: '', trainPlatform: '', flightAirline: '', flightNumber: '', flightGate: '', myCost: '', partnerCost: '' },
        return: { type: 'none', busBoarding: '', busPlatform: '', trainNumber: '', trainBogie: '', trainPlatform: '', flightAirline: '', flightNumber: '', flightGate: '', myCost: '', partnerCost: '' }
      }
    });
  };

  const resetItemForm = (date) => setItemForm({ 
    id: null, name: '', transportMode: 'public', myCost: '', partnerCost: '', 
    publicOriginSystem: '', publicOriginStation: '', publicDestSystem: '', publicDestStation: '', grabPickup: '', date: date || '' 
  });

  const updateTransportDetails = (direction, field, value) => {
    setTripForm(prev => ({
      ...prev,
      transport: {
        ...prev.transport,
        [direction]: { ...prev.transport[direction], [field]: value }
      }
    }));
  };

  // --- Calculation Helpers ---
  const formatCurrency = (amount) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount || 0);
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  const generateDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    let current = new Date(start);
    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const calculateTotalSpent = (trip) => {
    if (!trip) return { me: 0, partner: 0, total: 0 };
    
    let me = 0;
    let partner = 0;

    if (trip.transport) {
      me += Number(trip.transport.outbound?.myCost) || 0;
      partner += Number(trip.transport.outbound?.partnerCost) || 0;
      me += Number(trip.transport.return?.myCost) || 0;
      partner += Number(trip.transport.return?.partnerCost) || 0;
    }
    
    const itinerary = trip.itinerary || [];
    itinerary.forEach((item) => {
      let itemMe = Number(item.myCost) || 0;
      let itemPartner = Number(item.partnerCost) || 0;
      
      if (item.subItems) {
        item.subItems.forEach(sub => {
          itemMe += Number(sub.myCost) || 0;
          itemPartner += Number(sub.partnerCost) || 0;
        });
      }
      me += itemMe;
      partner += itemPartner;
    });

    return { me, partner, total: me + partner };
  };

  // --- Export to CSV ---
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
    csvContent += "ชื่อทริป,วันไป,วันกลับ,ใช้รวม,ฉันจ่ายรวม,แฟนจ่ายรวม,สถานที่/กิจกรรม,การเดินทาง,รายละเอียดการเดินทาง,ฉันจ่าย(หลัก),แฟนจ่าย(หลัก),กิจกรรมย่อย,ฉันจ่าย(ย่อย),แฟนจ่าย(ย่อย)\n";

    trips.forEach(trip => {
      const spent = calculateTotalSpent(trip);
      if (!trip.itinerary || trip.itinerary.length === 0) {
        csvContent += `${trip.name},${trip.startDate},${trip.endDate},${spent.total},${spent.me},${spent.partner},,,,,, \n`;
      } else {
        trip.itinerary.forEach((item, index) => {
          let transportInfo = '';
          if (item.transportMode === 'public') {
             const origin = item.publicOriginStation ? `[${item.publicOriginSystem}] ${item.publicOriginStation}` : '-';
             const dest = item.publicDestStation ? `[${item.publicDestSystem}] ${item.publicDestStation}` : '-';
             transportInfo = `จาก ${origin} ไป ${dest}`;
          }
          if (item.transportMode === 'grab') transportInfo = `จุดรับ: ${item.grabPickup || '-'}`;

          const prefix = index === 0 ? `${trip.name},${trip.startDate},${trip.endDate},${spent.total},${spent.me},${spent.partner}` : `,,,,,`;
          
          if (!item.subItems || item.subItems.length === 0) {
            csvContent += `${prefix},${item.name},${item.transportMode === 'public' ? 'รถสาธารณะ' : 'Grab/Taxi'},${transportInfo},${item.myCost || 0},${item.partnerCost || 0},,\n`;
          } else {
            item.subItems.forEach((sub, sIdx) => {
               if (sIdx === 0) {
                 csvContent += `${prefix},${item.name},${item.transportMode === 'public' ? 'รถสาธารณะ' : 'Grab/Taxi'},${transportInfo},${item.myCost || 0},${item.partnerCost || 0},${sub.name},${sub.myCost || 0},${sub.partnerCost || 0}\n`;
               } else {
                 csvContent += `,,,,,,,${item.name} (ต่อ),,,,${sub.name},${sub.myCost || 0},${sub.partnerCost || 0}\n`;
               }
            });
          }
        });
      }
    });

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "trip_planner_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTransportIcon = (type) => {
    if (type === 'bus') return <Bus size={18}/>;
    if (type === 'train') return <Train size={18}/>;
    if (type === 'plane') return <Plane size={18}/>;
    return null;
  };

  const getTransportName = (type) => {
    if (type === 'bus') return 'รถทัวร์/รถตู้';
    if (type === 'train') return 'รถไฟ';
    if (type === 'plane') return 'เครื่องบิน';
    return '';
  };

  // --- Render Sections ---
  const renderTransportFormSection = (direction) => {
    const data = tripForm.transport[direction];
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
             ยานพาหนะ ({direction === 'outbound' ? 'ขาไป' : 'ขากลับ'})
          </label>
          <select 
            value={data.type} 
            onChange={e => updateTransportDetails(direction, 'type', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none bg-white mb-3"
          >
            <option value="none">รถส่วนตัว / ไม่ระบุ</option>
            <option value="bus">🚌 รถทัวร์ / รถตู้</option>
            <option value="train">🚂 รถไฟ</option>
            <option value="plane">✈️ เครื่องบิน</option>
          </select>

          {data.type === 'bus' && (
            <div className="grid grid-cols-2 gap-3">
               <div>
                 <label className="block text-xs font-medium text-gray-600 mb-1">จุดขึ้นรถ</label>
                 <input type="text" value={data.busBoarding} onChange={e => updateTransportDetails(direction, 'busBoarding', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="เช่น หมอชิต 2" />
               </div>
               <div>
                 <label className="block text-xs font-medium text-gray-600 mb-1">ชานชาลา</label>
                 <input type="text" value={data.busPlatform} onChange={e => updateTransportDetails(direction, 'busPlatform', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="เช่น 108" />
               </div>
            </div>
          )}

          {data.type === 'train' && (
            <div className="grid grid-cols-3 gap-3">
               <div>
                 <label className="block text-xs font-medium text-gray-600 mb-1">เลขขบวน</label>
                 <input type="text" value={data.trainNumber} onChange={e => updateTransportDetails(direction, 'trainNumber', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="เช่น 9" />
               </div>
               <div>
                 <label className="block text-xs font-medium text-gray-600 mb-1">โบกี้</label>
                 <input type="text" value={data.trainBogie} onChange={e => updateTransportDetails(direction, 'trainBogie', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="เช่น 3" />
               </div>
               <div>
                 <label className="block text-xs font-medium text-gray-600 mb-1">ชานชะลา</label>
                 <input type="text" value={data.trainPlatform} onChange={e => updateTransportDetails(direction, 'trainPlatform', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="เช่น 4" />
               </div>
            </div>
          )}

          {data.type === 'plane' && (
            <div className="grid grid-cols-3 gap-3">
               <div className="col-span-1">
                 <label className="block text-xs font-medium text-gray-600 mb-1">สายการบิน</label>
                 <input type="text" value={data.flightAirline} onChange={e => updateTransportDetails(direction, 'flightAirline', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="เช่น AirAsia" />
               </div>
               <div>
                 <label className="block text-xs font-medium text-gray-600 mb-1">Flight</label>
                 <input type="text" value={data.flightNumber} onChange={e => updateTransportDetails(direction, 'flightNumber', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="เช่น FD300" />
               </div>
               <div>
                 <label className="block text-xs font-medium text-gray-600 mb-1">Gate</label>
                 <input type="text" value={data.flightGate} onChange={e => updateTransportDetails(direction, 'flightGate', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" placeholder="เช่น 51" />
               </div>
            </div>
          )}

          {data.type !== 'none' && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">ค่าใช้จ่ายส่วนนี้ (บาท)</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-blue-500"><User size={16}/></span>
                  <input type="number" min="0" value={data.myCost || ''} onChange={e => updateTransportDetails(direction, 'myCost', e.target.value)} className="w-full pl-9 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm" placeholder="ฉันจ่าย..." />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-rose-400"><Heart size={16}/></span>
                  <input type="number" min="0" value={data.partnerCost || ''} onChange={e => updateTransportDetails(direction, 'partnerCost', e.target.value)} className="w-full pl-9 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm" placeholder="แฟนจ่าย..." />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTripDisplayTransport = (trip) => {
    const outbound = trip.transport?.outbound || { type: trip.transportType || 'none', ...trip.transportDetails };
    const returnTrip = trip.transport?.return || { type: 'none' };

    if (outbound.type === 'none' && returnTrip.type === 'none') return null;

    return (
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {outbound.type !== 'none' && (
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 text-indigo-100"><ArrowRight size={60} className="opacity-20 transform -rotate-45" /></div>
             <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 shrink-0 z-10">{getTransportIcon(outbound.type)}</div>
             <div className="text-sm text-indigo-800 z-10">
               <p className="font-bold mb-1 border-b border-indigo-200 pb-1 flex justify-between">
                 <span>ขาไป • {getTransportName(outbound.type)}</span>
                 <span className="font-normal text-indigo-600">{trip.departureTime || ''}</span>
               </p>
               {outbound.type === 'bus' && <p>จุดขึ้นรถ: {outbound.busBoarding || '-'} | ชานชาลา: {outbound.busPlatform || '-'}</p>}
               {outbound.type === 'train' && <p>ขบวนที่: {outbound.trainNumber || '-'} | โบกี้: {outbound.trainBogie || '-'} | ชานชะลา: {outbound.trainPlatform || '-'}</p>}
               {outbound.type === 'plane' && <p>สายการบิน: {outbound.flightAirline || '-'} | Flight: {outbound.flightNumber || '-'} | Gate: {outbound.flightGate || '-'}</p>}
               
               {(Number(outbound.myCost) > 0 || Number(outbound.partnerCost) > 0) && (
                 <div className="mt-2 pt-2 border-t border-indigo-200/50 flex flex-wrap gap-2 text-xs">
                   {Number(outbound.myCost) > 0 && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium border border-blue-100">ฉัน: {formatCurrency(outbound.myCost)}</span>}
                   {Number(outbound.partnerCost) > 0 && <span className="bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full font-medium border border-rose-100">แฟน: {formatCurrency(outbound.partnerCost)}</span>}
                 </div>
               )}
             </div>
          </div>
        )}
        
        {returnTrip.type !== 'none' && (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 text-emerald-100"><ArrowLeft size={60} className="opacity-20" /></div>
             <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 shrink-0 z-10">{getTransportIcon(returnTrip.type)}</div>
             <div className="text-sm text-emerald-800 z-10">
               <p className="font-bold mb-1 border-b border-emerald-200 pb-1 flex justify-between">
                 <span>ขากลับ • {getTransportName(returnTrip.type)}</span>
                 <span className="font-normal text-emerald-600">{trip.returnTime || ''}</span>
               </p>
               {returnTrip.type === 'bus' && <p>จุดขึ้นรถ: {returnTrip.busBoarding || '-'} | ชานชาลา: {returnTrip.busPlatform || '-'}</p>}
               {returnTrip.type === 'train' && <p>ขบวนที่: {returnTrip.trainNumber || '-'} | โบกี้: {returnTrip.trainBogie || '-'} | ชานชะลา: {returnTrip.trainPlatform || '-'}</p>}
               {returnTrip.type === 'plane' && <p>สายการบิน: {returnTrip.flightAirline || '-'} | Flight: {returnTrip.flightNumber || '-'} | Gate: {returnTrip.flightGate || '-'}</p>}
               
               {(Number(returnTrip.myCost) > 0 || Number(returnTrip.partnerCost) > 0) && (
                 <div className="mt-2 pt-2 border-t border-emerald-200/50 flex flex-wrap gap-2 text-xs">
                   {Number(returnTrip.myCost) > 0 && <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-200">ฉัน: {formatCurrency(returnTrip.myCost)}</span>}
                   {Number(returnTrip.partnerCost) > 0 && <span className="bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full font-medium border border-rose-100">แฟน: {formatCurrency(returnTrip.partnerCost)}</span>}
                 </div>
               )}
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-rose-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">แพลนเที่ยวของเรา <Heart className="text-rose-500" fill="currentColor" size={24} /></h2>
          <p className="text-gray-500 mt-1">วางแผนความทรงจำดีๆ ไปด้วยกันแบบ Real-time</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Share Button (New) */}
          <button 
            onClick={() => setIsShareModalOpen(true)} 
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl transition-colors font-medium border ${coupleCode && user && coupleCode !== user.uid ? 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100' : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'}`}
          >
            <LinkIcon size={18} /> {coupleCode && user && coupleCode !== user.uid ? 'เชื่อมต่อแล้ว' : 'แชร์ให้แฟน'}
          </button>

          <button onClick={exportToCSV} className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl border border-gray-200 transition-colors" title="ส่งออกเป็น Excel/CSV">
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {trips.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <PlaneTakeoff className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 text-lg">ยังไม่มีทริปเลย มากดสร้างทริปกันเถอะ!</p>
          </div>
        ) : (
          trips.map(trip => {
            const spent = calculateTotalSpent(trip);

            return (
              <div key={trip.id} onClick={() => { setSelectedTripId(trip.id); setCurrentView('tripDetails'); }} className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 cursor-pointer group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-rose-400"></div>
                <div className="flex justify-between items-start mb-4 pl-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{trip.name}</h3>
                    <div className="flex flex-wrap items-center text-gray-500 text-sm mt-1 gap-4">
                      <span className="flex items-center gap-1"><Calendar size={14}/> {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); setTripFormTab('outbound'); setTripForm(trip); setIsTripModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"><Edit2 size={18} /></button>
                    <button onClick={(e) => handleDeleteTrip(trip.id, e)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
                
                <div className="pl-2 mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-medium">รวมทั้งหมด</span>
                      <span className="font-bold text-gray-700">{formatCurrency(spent.total)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-blue-500 font-medium block">ฉันจ่าย</span>
                      <span className="font-bold text-blue-700">{formatCurrency(spent.me)}</span>
                    </div>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <div className="text-left">
                      <span className="text-xs text-rose-400 font-medium block">แฟนจ่าย</span>
                      <span className="font-bold text-rose-600">{formatCurrency(spent.partner)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button onClick={() => { resetTripForm(); setIsTripModalOpen(true); }} className="fixed bottom-8 right-8 bg-rose-500 text-white p-4 rounded-full shadow-lg hover:bg-rose-600 hover:scale-105 transition-all flex items-center justify-center z-10">
        <Plus size={28} />
      </button>
    </div>
  );

  const renderTripDetails = () => {
    const trip = trips.find(t => t.id === selectedTripId);
    if (!trip) return null;
    const spent = calculateTotalSpent(trip);
    
    const tripDates = generateDateRange(trip.startDate, trip.endDate);
    const currentTabDate = tripDates.includes(activeTabDate) ? activeTabDate : (tripDates[0] || '');
    
    const filteredItinerary = (trip.itinerary || []).filter(item => {
      if (!item.date) return currentTabDate === tripDates[0];
      return item.date === currentTabDate;
    });

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <button onClick={() => setCurrentView('dashboard')} className="flex items-center text-gray-500 hover:text-rose-500 mb-4 transition-colors">
            <ArrowLeft size={20} className="mr-1" /> กลับหน้าหลัก
          </button>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{trip.name}</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
            <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full border border-gray-100"><Calendar size={16} className="text-teal-500"/> {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
          </div>

          {renderTripDisplayTransport(trip)}

          <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Wallet size={12}/> รวมใช้จ่ายไป</p>
              <p className="font-bold text-gray-800 text-lg sm:text-xl">{formatCurrency(spent.total)}</p>
            </div>
            <div>
              <p className="text-xs text-blue-500 mb-1 flex items-center gap-1"><User size={12}/> ฉันจ่ายไป</p>
              <p className="font-bold text-blue-700 text-lg sm:text-xl">{formatCurrency(spent.me)}</p>
            </div>
            <div>
              <p className="text-xs text-rose-400 mb-1 flex items-center gap-1"><Heart size={12}/> แฟนจ่ายไป</p>
              <p className="font-bold text-rose-600 text-lg sm:text-xl">{formatCurrency(spent.partner)}</p>
            </div>
          </div>
        </div>

        {tripDates.length > 0 && (
          <div className="flex overflow-x-auto gap-3 pb-2 mb-2 scrollbar-hide">
            {tripDates.map((date, index) => (
              <button 
                key={date}
                onClick={() => setActiveTabDate(date)}
                className={`whitespace-nowrap px-5 py-3 rounded-xl text-sm font-bold transition-all shrink-0 ${currentTabDate === date ? 'bg-rose-500 text-white shadow-md shadow-rose-200 scale-105' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}
              >
                วันที่ {index + 1} <span className={`font-normal block text-xs mt-1 ${currentTabDate === date ? 'text-rose-100' : 'text-gray-400'}`}>{formatDate(date)}</span>
              </button>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <MapPin className="text-rose-500"/> รายละเอียดการเดินทาง
            </h3>
            <button onClick={() => { resetItemForm(currentTabDate); setIsItemModalOpen(true); }} className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1 shadow-sm">
              <Plus size={16} /> เพิ่มสถานที่
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {(!filteredItinerary || filteredItinerary.length === 0) ? (
              <div className="text-center py-8 text-gray-400"><p>ยังไม่มีแผนการเดินทางในวันนี้ กดเพิ่มสถานที่ได้เลย!</p></div>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {filteredItinerary.map((item, index) => {
                  const itemMe = Number(item.myCost) || 0;
                  const itemPartner = Number(item.partnerCost) || 0;
                  const itemTotal = itemMe + itemPartner;

                  return (
                  <div key={item.id} className="relative flex flex-col md:flex-row items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-teal-100 text-teal-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 transform -translate-x-0 z-10">
                      {item.transportMode === 'public' ? <Train size={18} /> : <Car size={18} />}
                    </div>
                    
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-12 md:ml-0 p-4 rounded-xl border border-gray-100 bg-white shadow-sm group-hover:shadow-md transition-all relative">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
                        <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setItemForm({ ...item, myCost: item.myCost || item.cost || '', partnerCost: item.partnerCost || '', date: item.date || currentTabDate }); setIsItemModalOpen(true); }} className="text-gray-400 hover:text-blue-500 p-1"><Edit2 size={14}/></button>
                          <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                        </div>
                      </div>
                      
                      <div className="mb-3 text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        {item.transportMode === 'public' ? (
                          <div className="flex flex-col gap-1.5">
                             <span className="font-bold text-blue-700 flex items-center gap-1 mb-1 border-b border-blue-100 pb-1"><Train size={12}/> รถไฟฟ้า / สาธารณะ</span>
                             <div className="flex items-start gap-2">
                               <div className="w-2 h-2 rounded-full bg-blue-400 mt-1 shrink-0"></div>
                               <span>ขึ้น: {item.publicOriginSystem && <span className="font-semibold bg-blue-100 text-blue-800 px-1 rounded mx-1">{item.publicOriginSystem}</span>} 
                               <span className="font-medium text-gray-800">{item.publicOriginStation || 'ไม่ระบุ'}</span></span>
                             </div>
                             <div className="flex items-start gap-2">
                               <div className="w-2 h-2 rounded-full bg-red-400 mt-1 shrink-0"></div>
                               <span>ลง: {item.publicDestSystem && <span className="font-semibold bg-red-100 text-red-800 px-1 rounded mx-1">{item.publicDestSystem}</span>}
                               <span className="font-medium text-gray-800">{item.publicDestStation || 'ไม่ระบุ'}</span></span>
                             </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                             <span className="font-bold text-green-700 flex items-center gap-1 border-b border-green-100 pb-1 mb-1"><Car size={12}/> Grab / Taxi</span>
                             <span>จุดรับ: <span className="font-medium text-gray-800">{item.grabPickup || 'ไม่ระบุ'}</span></span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1 mt-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 font-medium">ค่าเดินทางหลักรวม</span>
                          <span className="font-bold text-gray-700">{formatCurrency(itemTotal)}</span>
                        </div>
                        {(itemMe > 0 || itemPartner > 0) && (
                          <div className="flex items-center justify-end gap-2 text-xs">
                            {itemMe > 0 && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">ฉัน: {formatCurrency(itemMe)}</span>}
                            {itemPartner > 0 && <span className="bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full">แฟน: {formatCurrency(itemPartner)}</span>}
                          </div>
                        )}
                      </div>

                      {item.subItems && item.subItems.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          <p className="text-xs text-gray-400 font-medium">กิจกรรม / ร้านอาหาร</p>
                          {item.subItems.map(sub => {
                            const subMe = Number(sub.myCost) || 0;
                            const subPartner = Number(sub.partnerCost) || 0;
                            const subTotal = subMe + subPartner;

                            return (
                            <div key={sub.id} className="flex flex-col text-sm bg-rose-50/50 p-2.5 rounded-lg group/sub border border-rose-100/50">
                              <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2 text-gray-700 font-medium"><Utensils size={14} className="text-rose-400" /> {sub.name}</div>
                                <div className="flex items-center gap-3">
                                  <span className="text-gray-700 font-bold">{formatCurrency(subTotal)}</span>
                                  <button onClick={() => handleDeleteSubItem(item.id, sub.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2 text-xs">
                                {subMe > 0 && <span className="text-blue-500">ฉัน: {formatCurrency(subMe)}</span>}
                                {subPartner > 0 && <span className="text-rose-400">แฟน: {formatCurrency(subPartner)}</span>}
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      )}

                      <button onClick={() => { setSubItemForm({ parentId: item.id, id: null, name: '', myCost: '', partnerCost: '' }); setIsSubItemModalOpen(true); }} className="mt-3 text-xs w-full py-2 bg-gray-50 text-rose-500 font-medium rounded-lg hover:bg-rose-50 transition-colors flex items-center justify-center gap-1 border border-dashed border-rose-200">
                        <Plus size={14} /> เพิ่มร้านอาหาร / กิจกรรมย่อย
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-24">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-rose-500 to-teal-500 bg-clip-text text-transparent flex items-center gap-2">
            <PlaneTakeoff size={24} className="text-rose-500" /> Nuttawat & Chadakarn Travel
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {!user ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <PlaneTakeoff size={48} className="text-rose-300 mb-4" />
            <p className="text-gray-500 font-medium">กำลังเตรียมพร้อมขึ้นบิน...</p>
          </div>
        ) : (
          currentView === 'dashboard' ? renderDashboard() : renderTripDetails()
        )}
      </main>

      {/* --- Share Modal (NEW) --- */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-rose-800 flex items-center gap-2"><LinkIcon size={18}/> เชื่อมต่อกับแฟน</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-rose-400 hover:text-rose-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-6">
              
              {/* Step 1: My Code */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">1. รหัสของคุณ (ส่งให้แฟนกรอก)</label>
                <div className="flex items-center gap-2">
                  <input readOnly value={user?.uid || ''} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-500 outline-none" />
                  <button onClick={() => copyToClipboard(user?.uid || '')} className="p-3 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition-colors" title="คัดลอกรหัส">
                    <Copy size={20} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-xs text-gray-400 font-bold">หรือ</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              {/* Step 2: Partner Code */}
              <form onSubmit={handleLinkPartner} className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">2. นำรหัสของแฟนมากรอกที่นี่</label>
                <input 
                  type="text" 
                  value={partnerCodeInput} 
                  onChange={e => setPartnerCodeInput(e.target.value)} 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm font-mono" 
                  placeholder="วางรหัสของแฟน..." 
                />
                <button type="submit" disabled={!partnerCodeInput.trim()} className="w-full mt-3 py-3 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 disabled:bg-rose-300 disabled:cursor-not-allowed transition-colors shadow-md shadow-rose-200">
                  เชื่อมต่อข้อมูล
                </button>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* --- Trip Modal --- */}
      {isTripModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-8">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-lg font-bold text-gray-800">{tripForm.id ? 'แก้ไขทริป' : 'สร้างทริปใหม่'}</h3>
              <button onClick={() => setIsTripModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSaveTrip} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อทริป</label>
                <input required type="text" value={tripForm.name} onChange={e => setTripForm({...tripForm, name: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" placeholder="เช่น ทริปเชียงใหม่กับที่รัก" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันไป</label>
                  <input required type="date" value={tripForm.startDate} onChange={e => setTripForm({...tripForm, startDate: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">วันกลับ</label>
                  <input required type="date" value={tripForm.endDate} onChange={e => setTripForm({...tripForm, endDate: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex border-b border-gray-200 mb-4">
                  <button type="button" onClick={() => setTripFormTab('outbound')} className={`flex-1 py-2 text-sm font-bold border-b-2 transition-colors ${tripFormTab === 'outbound' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    ขาไป
                  </button>
                  <button type="button" onClick={() => setTripFormTab('return')} className={`flex-1 py-2 text-sm font-bold border-b-2 transition-colors ${tripFormTab === 'return' ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                    ขากลับ
                  </button>
                </div>
                
                {tripFormTab === 'outbound' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">เวลาไป (รถออก)</label>
                      <input type="time" value={tripForm.departureTime} onChange={e => setTripForm({...tripForm, departureTime: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" />
                    </div>
                    {renderTransportFormSection('outbound')}
                  </>
                )}

                {tripFormTab === 'return' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">เวลากลับ (รถออก)</label>
                      <input type="time" value={tripForm.returnTime} onChange={e => setTripForm({...tripForm, returnTime: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" />
                    </div>
                    {renderTransportFormSection('return')}
                  </>
                )}
              </div>

              <div className="pt-4 flex gap-3 sticky bottom-0 bg-white pb-2">
                <button type="button" onClick={() => setIsTripModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">ยกเลิก</button>
                <button type="submit" className="flex-1 py-3 bg-rose-500 text-white font-medium rounded-xl hover:bg-rose-600 transition-colors shadow-md shadow-rose-200">บันทึกทริป</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Item Modal (Places) --- */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{itemForm.id ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่'}</h3>
              <button onClick={() => setIsItemModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSaveItem} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ไปไหน (สถานที่หลัก)</label>
                <input required type="text" value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none" placeholder="เช่น จ๊อดแฟร์, Central World" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">การเดินทางไปที่นี่</label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <label className={`cursor-pointer flex flex-col items-center p-3 rounded-xl border-2 transition-all ${itemForm.transportMode === 'public' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200 text-gray-500'}`}>
                    <input type="radio" name="transportMode" value="public" className="sr-only" checked={itemForm.transportMode === 'public'} onChange={() => setItemForm({...itemForm, transportMode: 'public'})} />
                    <Train size={24} className="mb-1" />
                    <span className="text-xs font-medium text-center">รถไฟฟ้า / สาธารณะ</span>
                  </label>
                  <label className={`cursor-pointer flex flex-col items-center p-3 rounded-xl border-2 transition-all ${itemForm.transportMode === 'grab' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-200 text-gray-500'}`}>
                    <input type="radio" name="transportMode" value="grab" className="sr-only" checked={itemForm.transportMode === 'grab'} onChange={() => setItemForm({...itemForm, transportMode: 'grab'})} />
                    <Car size={24} className="mb-1" />
                    <span className="text-xs font-medium text-center">Grab / Taxi</span>
                  </label>
                </div>

                {itemForm.transportMode === 'public' && (
                  <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <div>
                      <label className="block text-xs font-bold text-blue-800 mb-1">จุดเริ่มต้น (ขึ้นรถที่)</label>
                      <div className="flex gap-2">
                        <select 
                          value={itemForm.publicOriginSystem} 
                          onChange={e => setItemForm({...itemForm, publicOriginSystem: e.target.value, publicOriginStation: ''})}
                          className="w-1/3 p-2 border border-blue-200 rounded-lg text-sm bg-white outline-none focus:border-blue-400"
                        >
                          <option value="">ประเภทรถ</option>
                          {Object.keys(STATION_DATA).map(sys => <option key={sys} value={sys}>{sys}</option>)}
                        </select>
                        <select 
                          value={itemForm.publicOriginStation} 
                          onChange={e => setItemForm({...itemForm, publicOriginStation: e.target.value})}
                          disabled={!itemForm.publicOriginSystem}
                          className="w-2/3 p-2 border border-blue-200 rounded-lg text-sm bg-white outline-none focus:border-blue-400 disabled:bg-gray-100"
                        >
                          <option value="">{itemForm.publicOriginSystem ? 'เลือกสถานี...' : 'ระบุประเภทรถก่อน'}</option>
                          {itemForm.publicOriginSystem && STATION_DATA[itemForm.publicOriginSystem].map(station => (
                            <option key={station} value={station}>{station}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-red-800 mb-1">จุดหมาย (ลงรถที่)</label>
                      <div className="flex gap-2">
                        <select 
                          value={itemForm.publicDestSystem} 
                          onChange={e => setItemForm({...itemForm, publicDestSystem: e.target.value, publicDestStation: ''})}
                          className="w-1/3 p-2 border border-red-200 rounded-lg text-sm bg-white outline-none focus:border-red-400"
                        >
                          <option value="">ประเภทรถ</option>
                          {Object.keys(STATION_DATA).map(sys => <option key={sys} value={sys}>{sys}</option>)}
                        </select>
                        <select 
                          value={itemForm.publicDestStation} 
                          onChange={e => setItemForm({...itemForm, publicDestStation: e.target.value})}
                          disabled={!itemForm.publicDestSystem}
                          className="w-2/3 p-2 border border-red-200 rounded-lg text-sm bg-white outline-none focus:border-red-400 disabled:bg-gray-100"
                        >
                          <option value="">{itemForm.publicDestSystem ? 'เลือกสถานี...' : 'ระบุประเภทรถก่อน'}</option>
                          {itemForm.publicDestSystem && STATION_DATA[itemForm.publicDestSystem].map(station => (
                            <option key={station} value={station}>{station}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {itemForm.transportMode === 'grab' && (
                  <div className="bg-green-50/50 p-3 rounded-xl border border-green-100">
                    <label className="block text-xs font-medium text-green-800 mb-1">ขึ้นที่ไหน (จุดรับ)</label>
                    <div className="relative">
                      <Navigation size={14} className="absolute left-2.5 top-2.5 text-green-600" />
                      <input type="text" value={itemForm.grabPickup} onChange={e => setItemForm({...itemForm, grabPickup: e.target.value})} className="w-full pl-8 p-2 border border-green-200 rounded-lg text-sm focus:ring-1 focus:ring-green-500 outline-none" placeholder="เช่น หน้าโรงแรม, สยามพารากอน" />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ค่าเดินทางหลัก (บาท)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-blue-500"><User size={16}/></span>
                    <input type="number" min="0" value={itemForm.myCost} onChange={e => setItemForm({...itemForm, myCost: e.target.value})} className="w-full pl-9 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm" placeholder="ฉันจ่าย..." />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-rose-400"><Heart size={16}/></span>
                    <input type="number" min="0" value={itemForm.partnerCost} onChange={e => setItemForm({...itemForm, partnerCost: e.target.value})} className="w-full pl-9 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-sm" placeholder="แฟนจ่าย..." />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">ยกเลิก</button>
                <button type="submit" className="flex-1 py-3 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 transition-colors shadow-md shadow-teal-200">บันทึกสถานที่</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Sub-Item Modal --- */}
      {isSubItemModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-rose-50 px-6 py-4 border-b border-rose-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-rose-800 flex items-center gap-2"><Utensils size={18}/> เพิ่มกิจกรรม / ร้านอาหาร</h3>
              <button onClick={() => setIsSubItemModalOpen(false)} className="text-rose-400 hover:text-rose-600">&times;</button>
            </div>
            <form onSubmit={handleSaveSubItem} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อร้าน / กิจกรรม</label>
                <input required type="text" value={subItemForm.name} onChange={e => setSubItemForm({...subItemForm, name: e.target.value})} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none" placeholder="เช่น Momo Paradise, กินขนม" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ค่าใช้จ่าย (บาท)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-blue-500"><User size={16}/></span>
                    <input type="number" min="0" value={subItemForm.myCost} onChange={e => setSubItemForm({...subItemForm, myCost: e.target.value})} className="w-full pl-9 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm" placeholder="ฉันจ่าย..." />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-rose-400"><Heart size={16}/></span>
                    <input type="number" min="0" value={subItemForm.partnerCost} onChange={e => setSubItemForm({...subItemForm, partnerCost: e.target.value})} className="w-full pl-9 p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-sm" placeholder="แฟนจ่าย..." />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsSubItemModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">ยกเลิก</button>
                <button type="submit" className="flex-1 py-3 bg-rose-500 text-white font-medium rounded-xl hover:bg-rose-600 transition-colors shadow-md shadow-rose-200">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}