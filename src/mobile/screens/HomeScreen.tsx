
import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { useCollection } from '@/firebase';
import { collection, query, limit } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Hotel } from '@/lib/types';
import { Search, MapPin, Star } from 'lucide-react-native';

export function HomeScreen({ navigation }: any) {
  const firestore = useFirestore();
  const featuredQuery = query(collection(firestore, 'hotels'), limit(6));
  const { data: hotels, isLoading } = useCollection<Hotel>(featuredQuery);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Mobile Search Header */}
        <View className="bg-[#1E90FF] p-6 pb-10 rounded-b-[3rem]">
          <Text className="text-white text-3xl font-black tracking-tight">Find Your Perfect</Text>
          <Text className="text-[#FF6F3C] text-4xl font-black tracking-tight">Himalayan Stay</Text>
          
          <View className="flex-row items-center bg-white mt-6 px-4 h-14 rounded-full shadow-lg">
            <Search color="#1E90FF" size={20} />
            <TextInput 
              placeholder="Search destinations..." 
              className="flex-1 ml-3 font-bold text-sm"
            />
          </View>
        </View>

        {/* Featured Hotels */}
        <View className="px-6 py-8">
          <Text className="text-xl font-black mb-6">Smart Suggestions</Text>
          
          {isLoading ? (
            <Text className="text-gray-400">Fetching best rates...</Text>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {hotels?.map((hotel) => (
                <TouchableOpacity 
                  key={hotel.id} 
                  className="w-[48%] mb-6 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                  onPress={() => navigation.navigate('HotelDetail', { id: hotel.id })}
                >
                  <Image 
                    source={{ uri: hotel.images[0]?.startsWith('http') ? hotel.images[0] : 'https://picsum.photos/seed/hotel/400/300' }} 
                    className="h-32 w-full"
                  />
                  <View className="p-3">
                    <Text className="font-black text-sm text-[#1E90FF]" numberOfLines={1}>{hotel.name}</Text>
                    <View className="flex-row items-center mt-1">
                      <MapPin size={10} color="#666" />
                      <Text className="text-[10px] text-gray-500 ml-1 font-bold">{hotel.city}</Text>
                    </View>
                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="font-black text-xs">₹{hotel.minPrice}</Text>
                      <View className="bg-[#febb02] px-1.5 py-0.5 rounded flex-row items-center">
                        <Star size={8} fill="black" />
                        <Text className="text-[8px] font-black ml-1">{hotel.rating}</Text>
                      </View>
                    </View>
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
