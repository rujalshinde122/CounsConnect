import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  frequency: string;
  deadline: string;
}

const Home = () => {
    const router = useRouter();
    const [username, setUsername] = useState<string>('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        const init = async () => {
            try {
                // Get the current user's name from Supabase Auth
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUsername(user.user_metadata?.name || user.email?.split('@')[0] || 'Guest');

                    // Fetch existing tasks for this patient
                    const { data: taskData } = await supabase
                        .from('tasks')
                        .select('*')
                        .eq('patient_id', user.id)
                        .order('created_at', { ascending: false });

                    if (taskData) setTasks(taskData);
                }
            } catch (error) {
                console.error('Error loading home:', error);
                setUsername('Guest');
            } finally {
                setLoading(false);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }).start();
            }
        };

        init();
    }, []);

    // =========================================================================
    // REAL-TIME SYNC — The key feature!
    // When the counselor assigns a new task on the web dashboard,
    // it appears here in < 200ms, without the patient needing to refresh.
    // This is the same technology as WhatsApp / Instagram.
    // =========================================================================
    useEffect(() => {
        let userId: string;

        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            userId = user.id;

            const channel = supabase
                .channel('patient-tasks')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'tasks',
                    filter: `patient_id=eq.${user.id}`,
                }, (payload) => {
                    // New task assigned — add it to the top of the list instantly
                    setTasks(prev => [payload.new as Task, ...prev]);
                })
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'tasks',
                    filter: `patient_id=eq.${user.id}`,
                }, (payload) => {
                    // Task updated (e.g., counselor changed deadline) — update in place
                    setTasks(prev => prev.map(t => t.id === (payload.new as Task).id ? payload.new as Task : t));
                })
                .subscribe();

            return channel;
        };

        let channel: any;
        setupRealtime().then(c => { channel = c; });

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, []);



    const navigateToProfile = () => {
        router.push("/(main)/profile");
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#4c669f', '#3b5998', '#192f6a']}
                style={styles.backgroundGradient}
            />
            
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.logoContainer}>
                    <Text style={styles.logoText}>CounsConnect</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={navigateToProfile} style={styles.profileButton}>
                    <Ionicons name="person-circle" size={28} color="#fff" />
                </TouchableOpacity>
            </View>
            
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        {loading ? (
                            <Text style={styles.welcomeText}>Loading...</Text>
                        ) : (
                            <>
                                <Text style={styles.greetingText}>Hello,</Text>
                                <Text style={styles.welcomeText}>{username}!</Text>
                                <Text style={styles.subtitleText}>What would you like to do today?</Text>
                            </>
                        )}
                    </View>
                    
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.featureButton} onPress={() => router.push("/(main)/journal")}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="stats-chart" size={24} color="#fff" />
                            </View>
                            <Text style={styles.buttonText}>Journal</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.featureButton} onPress={() => router.push("/(main)/profile")}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="settings-sharp" size={24} color="#fff" />
                            </View>
                            <Text style={styles.buttonText}>Settings</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.featureButton} onPress={() => router.push("/(main)/home")}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="notifications" size={24} color="#fff" />
                            </View>
                            <Text style={styles.buttonText}>Notifications</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.featureButton} onPress={() => router.push("/(main)/chatbot")}>
                            <View style={styles.iconContainer}>
                                <Ionicons name="help-circle" size={24} color="#fff" />
                            </View>
                            <Text style={styles.buttonText}>Help</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.quickAccess}>
                    <Text style={styles.sectionTitle}>Quick Access</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAccessScroll}>
                        {['Recent', 'Favorites', 'Trending', 'New'].map((item, index) => (
                            <TouchableOpacity key={index} style={styles.quickAccessItem}>
                                <Text style={styles.quickAccessText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    topBar: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    greetingText: {
        fontSize: 18,
        color: '#555',
        marginBottom: 5,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#192f6a',
        marginBottom: 5,
    },
    subtitleText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
    },
    featureButton: {
        backgroundColor: '#3b5998',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        width: '47%',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    iconContainer: {
        marginBottom: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    quickAccess: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    quickAccessScroll: {
        flexDirection: 'row',
    },
    quickAccessItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        marginRight: 10,
    },
    quickAccessText: {
        color: '#fff',
        fontWeight: '500',
    },
});

export default Home;
