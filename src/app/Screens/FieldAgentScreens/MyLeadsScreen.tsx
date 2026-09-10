import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LeadCard, LeadDetailModal } from "../../../components/FieldAgentComponent";
import { LeadItem, LeadStatus, useFieldAgent } from "../../../constants/fieldAgentData";

const FILTER_TABS: Array<{ id: string; label: string; status?: LeadStatus }> = [
  { id: "ALL", label: "All Leads" },
  { id: "NEW", label: "New", status: "NEW" },
  { id: "VERIFIED", label: "Verified", status: "VERIFIED" },
  { id: "RENTED", label: "Rented", status: "RENTED" },
  { id: "SOLD", label: "Sold", status: "SOLD" },
];

export function MyLeadsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { leads } = useFieldAgent();

  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      if (selectedFilter !== "ALL" && item.status !== selectedFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.ownerName.toLowerCase().includes(query);
        const matchesLocality = item.locality.toLowerCase().includes(query);
        const matchesType = item.propertyType.toLowerCase().includes(query);
        const matchesId = item.id.toLowerCase().includes(query);
        return matchesName || matchesLocality || matchesType || matchesId;
      }
      return true;
    });
  }, [leads, selectedFilter, searchQuery]);

  const handleRefresh = () => {
    setRefreshing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };

  const handleLeadPress = (lead: LeadItem) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedLead(lead);
    setIsDetailModalVisible(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Submitted Leads</Text>
          <Text style={styles.headerSub}>
            Tracking {leads.length} properties submitted by you
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } catch {}
            router.push("/FiledAgentPanel/(tabs)/visits" as any);
          }}
          style={styles.addBtn}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>New Lead</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by owner, locality, 2BHK, ID..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather name="x-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_TABS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => {
            const isSelected = selectedFilter === item.id;
            const count =
              item.id === "ALL"
                ? leads.length
                : leads.filter((l) => l.status === item.status).length;

            return (
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setSelectedFilter(item.id);
                }}
                style={[
                  styles.filterTab,
                  isSelected && styles.filterTabActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isSelected && styles.filterTabTextActive,
                  ]}
                >
                  {item.label}
                </Text>
                <View
                  style={[
                    styles.countPill,
                    isSelected && styles.countPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      isSelected && styles.countTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Leads FlatList */}
      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#0D9488"]}
            tintColor="#0D9488"
          />
        }
        renderItem={({ item }) => (
          <LeadCard lead={item} onPress={handleLeadPress} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Feather name="folder" size={36} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Leads Found</Text>
            <Text style={styles.emptySub}>
              {searchQuery
                ? "Try searching with a different locality or name."
                : "You haven't submitted any leads under this filter yet."}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/FiledAgentPanel/(tabs)/visits" as any)}
              style={styles.emptyAddBtn}
            >
              <Ionicons name="add-circle" size={18} color="#FFFFFF" />
              <Text style={styles.emptyAddBtnText}>Submit Your First Lead</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Lead Detail Sheet */}
      <LeadDetailModal
        lead={selectedLead}
        visible={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  headerSub: {
    fontSize: 11.5,
    color: "#64748B",
    marginTop: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D9488",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 4,
  },
  addBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "800",
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: "#0F172A",
    fontWeight: "500",
  },
  filtersWrapper: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: "#0D9488",
    borderColor: "#0D9488",
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  countPill: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  countPillActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  countText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
  },
  countTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: 20,
    paddingBottom: 110,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyIconBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptySub: {
    fontSize: 12.5,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    maxWidth: "80%",
    lineHeight: 18,
  },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D9488",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 18,
    gap: 6,
  },
  emptyAddBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "800",
  },
});
