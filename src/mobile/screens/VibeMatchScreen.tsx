
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Sparkles, Compass, CheckCircle2 } from 'lucide-react-native';
import { getVibeMatchSuggestionAction } from '@/ai/flows/vibe-match-flow';

export function VibeMatchScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const startMatch = async () => {
    setLoading(true);
    // Reusing the same logic from Web
    const res = await getVibeMatchSuggestionAction({
      travelVibe: 'peace',
      travelerType: 'couple',
      atmosphere: 'away_from_crowd'
    });
    setResult(res.data);
    setLoading(false);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-6">
      <View className="items-center mb-10">
        <View className="bg-[#FF6F3C]/10 p-6 rounded-full mb-4">
          <Sparkles color="#FF6F3C" size={40} />
        </View>
        <Text className="text-2xl font-black text-center">Tripzy AI Vibe Match™</Text>
        <Text className="text-gray-500 text-center mt-2 font-medium">
          Let our smart expert find your soul destination.
        </Text>
      </View>

      {!result && !loading && (
        <TouchableOpacity 
          onPress={startMatch}
          className="bg-[#1E90FF] h-16 rounded-full items-center justify-center shadow-lg shadow-blue-400"
        >
          <View className="flex-row items-center">
            <Compass color="white" size={20} />
            <Text className="text-white font-black text-lg ml-2">Analyze My Vibe</Text>
          </View>
        </TouchableOpacity>
      )}

      {loading && <ActivityIndicator size="large" color="#1E90FF" />}

      {result && (
        <View className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-blue-50 animate-in fade-in slide-in-from-bottom-10">
          <View className="bg-green-50 self-start px-4 py-1 rounded-full mb-4">
            <Text className="text-green-700 text-[10px] font-black uppercase tracking-widest">Match Found!</Text>
          </View>
          <Text className="text-4xl font-black text-[#1E90FF] tracking-tighter mb-4">{result.suggestedLocation}</Text>
          <Text className="text-gray-600 leading-relaxed font-medium italic">"{result.reasoning}"</Text>
          
          <View className="mt-8 pt-8 border-t border-gray-100">
            <View className="flex-row items-center mb-4">
              <CheckCircle2 color="#FF6F3C" size={18} />
              <Text className="ml-3 font-bold">Stay: {result.accommodationType}</Text>
            </View>
            <View className="flex-row items-center">
              <CheckCircle2 color="#FF6F3C" size={18} />
              <Text className="ml-3 font-bold">Best Time: {result.bestTimeToVisit}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
