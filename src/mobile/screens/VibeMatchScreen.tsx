
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Sparkles, Compass, CheckCircle2 } from 'lucide-react-native';
import { getVibeMatchSuggestionAction } from '@/ai/flows/vibe-match-flow';

/**
 * @fileOverview Tripzy AI Vibe Match Screen for Mobile.
 * Standardized using StyleSheet to resolve TypeScript className mismatch.
 */

export function VibeMatchScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const startMatch = async () => {
    setLoading(true);
    try {
        const res = await getVibeMatchSuggestionAction({
            travelVibe: 'peace',
            travelerType: 'couple',
            atmosphere: 'away_from_crowd'
        });
        if (res.success) {
            setResult(res.data);
        }
    } catch (e) {
        console.error("Vibe Match Failure:", e);
    } finally {
        setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Sparkles color="#FF6F3C" size={40} />
        </View>
        <Text style={styles.title}>Tripzy AI Vibe Match™</Text>
        <Text style={styles.subtitle}>
          Let our smart expert find your soul destination in the Himalayas.
        </Text>
      </View>

      {!result && !loading && (
        <TouchableOpacity 
          onPress={startMatch}
          style={styles.actionButton}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <Compass color="white" size={20} />
            <Text style={styles.buttonText}>Analyze My Vibe</Text>
          </View>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1E90FF" />
            <Text style={styles.loadingText}>Syncing with Himalayan Intelligence...</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultCard}>
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>MATCH FOUND!</Text>
          </View>
          <Text style={styles.locationTitle}>{result.suggestedLocation}</Text>
          <Text style={styles.reasoning}>"{result.reasoning}"</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <CheckCircle2 color="#FF6F3C" size={18} />
            <Text style={styles.detailText}>Stay: {result.accommodationType}</Text>
          </View>
          <View style={styles.detailRow}>
            <CheckCircle2 color="#FF6F3C" size={18} />
            <Text style={styles.detailText}>Best Time: {result.bestTimeToVisit}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  contentContainer: { padding: 24, paddingBottom: 60 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconCircle: { backgroundColor: 'rgba(255, 111, 60, 0.1)', padding: 24, borderRadius: 100, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center', color: '#1a1a1a', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#64748b', textAlign: 'center', marginTop: 8, fontWeight: '500', lineHeight: 22 },
  actionButton: { backgroundColor: '#1E90FF', height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#1E90FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  buttonContent: { flexDirection: 'row', alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '900', fontSize: 18, marginLeft: 10 },
  loadingContainer: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#1E90FF', fontWeight: '700', fontSize: 14 },
  resultCard: { backgroundColor: 'white', padding: 32, borderRadius: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 4, borderWidth: 1, borderColor: '#f1f5f9' },
  matchBadge: { backgroundColor: '#f0fdf4', alignSelf: 'flex-start', borderRadius: 20, marginBottom: 16, paddingHorizontal: 12, paddingVertical: 4 },
  matchBadgeText: { color: '#16a34a', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  locationTitle: { fontSize: 42, fontWeight: '900', color: '#1E90FF', letterSpacing: -2, marginBottom: 12 },
  reasoning: { fontSize: 16, color: '#4b5563', lineHeight: 24, fontStyle: 'italic', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 24 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  detailText: { marginLeft: 12, fontSize: 15, fontWeight: '700', color: '#1a1a1a' }
});
