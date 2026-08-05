'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '../../store/useStore';
import styles from './dashboard.module.css';

// Dynamically import the map component since leaflet requires the window object
const TripMap = dynamic(() => import('../../components/Map'), { ssr: false });

export default function Dashboard() {
  const [trips, setTrips] = useState<any[]>([]);
  const { preferences, updatePreferences } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTrips(data.trips);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.container}><div className={styles.spinner}></div></div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Your Travel Headquarters</h1>
          <p className={styles.subtitle}>Welcome back! Here are your personalized trips and wishlists.</p>
        </div>
        
        <div className={styles.preferencesBox}>
          <h3>Quick Preferences</h3>
          <label>
            Theme:
            <select value={preferences.theme} onChange={(e) => updatePreferences({ theme: e.target.value as any })}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      </header>

      <section className={styles.tripSection}>
        <h2 className={styles.sectionTitle}>Upcoming Adventures</h2>
        <div className={styles.tripGrid}>
          {trips.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No trips planned yet. Head to the AI Assistant to start planning!</p>
              <a href="/chat" className={styles.btnPrimary}>Plan a Trip</a>
            </div>
          ) : (
            trips.map(trip => (
              <div key={trip.id} className={styles.tripCard}>
                {trip.journals?.[0]?.content?.match(/!\[.*?\]\((.*?)\)/)?.[1] && (
                  <div 
                    className={styles.cardImage} 
                    style={{ backgroundImage: `url(${trip.journals[0].content.match(/!\[.*?\]\((.*?)\)/)[1]})` }}
                  />
                )}
                <div className={styles.cardContent}>
                  <h3>{trip.title}</h3>
                  <p className={styles.destination}>📍 {trip.destination}</p>
                  <p className={styles.dates}>
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </p>
                  <div className={styles.budgetBadge}>${trip.budget}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Example Interactive Map (Static coordinates for demo purposes) */}
      <section className={styles.mapSection}>
        <h2 className={styles.sectionTitle}>Explore the World</h2>
        <div className={styles.mapWrapper}>
          <TripMap 
            center={[48.8566, 2.3522]} // Paris default
            locations={[
              { name: 'Eiffel Tower', lat: 48.8584, lng: 2.2945 },
              { name: 'Louvre Museum', lat: 48.8606, lng: 2.3376 }
            ]} 
          />
        </div>
      </section>
    </div>
  );
}
