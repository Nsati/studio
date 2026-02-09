
import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { ChevronLeft, Star, MapPin, ShieldAlert, Signal, Car, CheckCircle2 } from 'lucide-react-native';

export function HotelDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const firestore = useFirestore();
  
  const hotelRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'hotels', id);
  }, [firestore, id]);

  const { data: hotel, isLoading } = useDoc<Hotel>(hotelRef);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading Property Details...</Text>
      </View>
    );
  }

  if (!hotel) {
    return (
      <View style={styles.center}>
        <Text>Property not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: hotel.images[0]?.startsWith('http') ? hotel.images[0] : 'https://picsum.photos/seed/hotel/800/600' }} 
            style={styles.heroImage}
          />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>SMART VERIFIED</Text>
            </View>
            <View style={styles.ratingRow}>
              <Star size={14} fill="#febb02" color="#febb02" />
              <Text style={styles.ratingText}>{hotel.rating}</Text>
            </View>
          </View>

          <Text style={styles.title}>{hotel.name}</Text>
          
          <View style={styles.locationRow}>
            <MapPin size={14} color="#006ce4" />
            <Text style={styles.locationText}>{hotel.city}, Uttarakhand</Text>
          </View>

          {/* Smart Insights Card */}
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <ShieldAlert size={18} color="#003580" />
              <Text style={styles.insightTitle}>SMART INSIGHTS</Text>
            </View>
            
            <View style={styles.insightGrid}>
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>SAFETY SCORE</Text>
                <Text style={styles.insightValue}>{hotel.mountainSafetyScore}/100</Text>
              </View>
              <View style={styles.insightItem}>
                <Text style={styles.insightLabel}>LANDSLIDE RISK</Text>
                <Text style={[styles.insightValue, { color: hotel.landslideRisk === 'Low' ? '#16a34a' : '#ea580c' }]}>
                  {hotel.landslideRisk}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>About this stay</Text>
          <Text style={styles.description}>{hotel.description}</Text>

          {/* Amenities */}
          <Text style={styles.sectionTitle}>Facilities</Text>
          <View style={styles.amenityList}>
            {hotel.amenities.map((item, index) => (
              <View key={index} style={styles.amenityItem}>
                <CheckCircle2 size={16} color="#16a34a" />
                <Text style={styles.amenityText}>{item.replace('-', ' ')}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>Starting from</Text>
          <Text style={styles.priceValue}>₹{hotel.minPrice?.toLocaleString()}</Text>
        </View>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Check Availability</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontWeight: '900', color: '#1E90FF' },
  imageContainer: { height: 300, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', top: 20, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  content: { padding: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tag: { backgroundColor: '#febb02', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tagText: { fontSize: 10, fontWeight: '900', color: 'black' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { marginLeft: 4, fontWeight: '900', fontSize: 14 },
  title: { fontSize: 28, fontWeight: '900', color: '#1a1a1a', marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  locationText: { color: '#006ce4', fontWeight: '700', marginLeft: 4, textDecorationLine: 'underline' },
  insightCard: { backgroundColor: '#f0f6ff', padding: 20, borderRadius: 16, marginBottom: 32 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  insightTitle: { fontWeight: '900', fontSize: 12, color: '#003580', marginLeft: 8, letterSpacing: 1 },
  insightGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  insightItem: { flex: 1 },
  insightLabel: { fontSize: 9, fontWeight: '900', color: '#666', marginBottom: 4 },
  insightValue: { fontSize: 14, fontWeight: '900' },
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 16, marginTop: 8 },
  description: { fontSize: 15, color: '#4b5563', lineHeight: 24, marginBottom: 24 },
  amenityList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 100 },
  amenityItem: { width: '50%', flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  amenityText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#374151', textTransform: 'capitalize' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 10, color: '#666', fontWeight: '700' },
  priceValue: { fontSize: 20, fontWeight: '900', color: '#1a1a1a' },
  bookButton: { backgroundColor: '#006ce4', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8 },
  bookButtonText: { color: 'white', fontWeight: '900', fontSize: 14 }
});
