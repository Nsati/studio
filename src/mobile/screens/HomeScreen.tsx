
import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, TextInput, StyleSheet } from 'react-native';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import type { Hotel } from '@/lib/types';
import { Search, MapPin, Star, ShieldCheck } from 'lucide-react-native';

export function HomeScreen({ navigation }: any) {
  const firestore = useFirestore();
  const featuredQuery = query(collection(firestore, 'hotels'), limit(6));
  const { data: hotels, isLoading } = useCollection<Hotel>(featuredQuery);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Mobile Search Header */}
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>YOUR TRIPZY</Text>
          <Text style={styles.headerTitle}>Smart Companion</Text>
          
          <View style={styles.searchBar}>
            <Search color="#1E90FF" size={20} />
            <TextInput 
              placeholder="Where in Uttarakhand?" 
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Live Status Bar */}
        <View style={styles.liveStatus}>
          <ShieldCheck color="#16a34a" size={16} />
          <Text style={styles.liveStatusText}>Verified Mountain Access: STABLE</Text>
        </View>

        {/* Featured Hotels */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Smart Suggestions</Text>
            <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
          </View>
          
          {isLoading ? (
            <Text style={styles.loadingText}>Syncing satellite data...</Text>
          ) : (
            <View style={styles.grid}>
              {hotels?.map((hotel) => (
                <TouchableOpacity 
                  key={hotel.id} 
                  style={styles.card}
                  onPress={() => navigation.navigate('HotelDetail', { id: hotel.id })}
                >
                  <Image 
                    source={{ uri: hotel.images[0]?.startsWith('http') ? hotel.images[0] : 'https://picsum.photos/seed/hotel/400/300' }} 
                    style={styles.cardImage}
                  />
                  {hotel.discount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>SAVE {hotel.discount}%</Text>
                    </View>
                  )}
                  <View style={styles.cardContent}>
                    <Text style={styles.hotelName} numberOfLines={1}>{hotel.name}</Text>
                    <View style={styles.cardFooter}>
                      <View style={styles.locationRow}>
                        <MapPin size={10} color="#006ce4" />
                        <Text style={styles.cityText}>{hotel.city}</Text>
                      </View>
                      <View style={styles.ratingBadge}>
                        <Star size={8} fill="black" color="black" />
                        <Text style={styles.ratingText}>{hotel.rating}</Text>
                      </View>
                    </View>
                    <Text style={styles.price}>₹{hotel.minPrice?.toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#1E90FF', padding: 24, paddingBottom: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerSubtitle: { color: 'rgba(255,255,255,0.7)', fontWeight: '900', fontSize: 10, letterSpacing: 2 },
  headerTitle: { color: 'white', fontSize: 32, fontWeight: '900', marginTop: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginTop: 24, paddingHorizontal: 16, height: 56, borderRadius: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  searchInput: { flex: 1, marginLeft: 12, fontWeight: '700', color: '#1a1a1a' },
  liveStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4', paddingVertical: 10, marginHorizontal: 24, marginTop: -20, borderRadius: 12, borderWidth: 1, borderColor: '#dcfce7' },
  liveStatusText: { color: '#16a34a', fontWeight: '900', fontSize: 10, marginLeft: 8, letterSpacing: 0.5 },
  section: { padding: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#1a1a1a' },
  viewAll: { color: '#1E90FF', fontWeight: '900', fontSize: 12 },
  loadingText: { color: '#94a3b8', fontWeight: '700', fontStyle: 'italic' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: 'white', borderRadius: 24, marginBottom: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardImage: { height: 120, width: '100%' },
  discountBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: '#ef4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discountText: { color: 'white', fontSize: 8, fontWeight: '900' },
  cardContent: { padding: 12 },
  hotelName: { fontWeight: '900', fontSize: 13, color: '#1a1a1a', marginBottom: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  cityText: { fontSize: 10, color: '#64748b', fontWeight: '700', marginLeft: 2 },
  ratingBadge: { backgroundColor: '#febb02', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4 },
  ratingText: { fontSize: 9, fontWeight: '900', marginLeft: 2 },
  price: { fontSize: 14, fontWeight: '900', color: '#1E90FF', marginTop: 8 }
});
