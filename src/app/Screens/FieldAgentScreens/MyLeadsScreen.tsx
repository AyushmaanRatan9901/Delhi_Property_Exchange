import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  LeadCard,
  LeadDetailModal,
} from "../../../components/FieldAgentComponent";
import {
  LeadItem,
  LeadStatus,
  useFieldAgent,
} from "../../../constants/fieldAgentData";
import { useResponsiveTheme } from "../../../constants/theme";

const getFilterTabs = (
  t: (key: string) => string,
): Array<{ id: string; label: string; status?: LeadStatus }> => [
  { id: "ALL", label: t("leads.filterAll") },
  { id: "NEW", label: t("leads.filterNew"), status: "NEW" },
  { id: "VERIFIED", label: t("leads.filterVerified"), status: "VERIFIED" },
  { id: "RENTED", label: t("leads.filterRented"), status: "RENTED" },
  { id: "SOLD", label: t("leads.filterSold"), status: "SOLD" },
];

export function MyLeadsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useResponsiveTheme();
  const { t } = useTranslation();
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

  const handleLeadPress = useCallback((lead: LeadItem) => {
    try {
      Haptics.selectionAsync();
    } catch {}
    setSelectedLead(lead);
    setIsDetailModalVisible(true);
  }, []);

  const renderLeadItem = useCallback(
    ({ item }: { item: LeadItem }) => (
      <LeadCard lead={item} onPress={handleLeadPress} />
    ),
    [handleLeadPress],
  );

  const keyExtractor = useCallback(
    (item: LeadItem) =>
      item.id || item._id || `${item.ownerPhone}-${item.submissionDate}`,
    [],
  );

  const renderEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <View
          style={[
            styles.emptyIconBox,
            { backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9" },
          ]}
        >
          <Feather
            name="folder"
            size={36}
            color={isDark ? colors.textMuted : "#94A3B8"}
          />
        </View>
        <Text
          style={[
            styles.emptyTitle,
            { color: isDark ? colors.textPrimary : "#0F172A" },
          ]}
        >
          {t("leads.noLeadsFound")}
        </Text>
        <Text
          style={[
            styles.emptySub,
            { color: isDark ? colors.textMuted : "#64748B" },
          ]}
        >
          {searchQuery
            ? t("leads.noLeadsSearchSub")
            : t("leads.noLeadsFilterSub")}
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/FiledAgentPanel/(tabs)/visits" as any)}
          style={[
            styles.emptyAddBtn,
            { backgroundColor: isDark ? "#14B8A6" : "#0D9488" },
          ]}
        >
          <Ionicons name="add-circle" size={18} color="#FFFFFF" />
          <Text style={styles.emptyAddBtnText}>
            {t("leads.submitFirstLeadBtn")}
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [searchQuery, router, isDark, colors],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.background : "#F8FAFC",
        },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? colors.cardBackground : "#FFFFFF"}
      />

      {/* Top Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(insets.top, 10) + 8,
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderBottomColor: isDark ? colors.border : "#F1F5F9",
          },
        ]}
      >
        <View>
          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? colors.textPrimary : "#0F172A" },
            ]}
          >
            {t("leads.headerTitle")}
          </Text>
          <Text
            style={[
              styles.headerSub,
              { color: isDark ? colors.textMuted : "#64748B" },
            ]}
          >
            {t("leads.headerSub", { count: leads.length })}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } catch {}
            router.push("/FiledAgentPanel/(tabs)/addLead" as any);
          }}
          style={[
            styles.addBtn,
            { backgroundColor: isDark ? "#14B8A6" : "#0D9488" },
          ]}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addBtnText}>{t("leads.newLeadBtn")}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View
        style={[
          styles.searchBarContainer,
          { backgroundColor: isDark ? colors.cardBackground : "#FFFFFF" },
        ]}
      >
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: isDark ? colors.surfaceLight : "#F1F5F9",
              borderColor: isDark ? colors.border : "transparent",
              borderWidth: isDark ? 1 : 0,
            },
          ]}
        >
          <Feather
            name="search"
            size={18}
            color={isDark ? colors.textMuted : "#94A3B8"}
          />
          <TextInput
            style={[
              styles.searchInput,
              { color: isDark ? colors.textPrimary : "#0F172A" },
            ]}
            placeholder="Search by owner, locality, 2BHK, ID..."
            placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Feather
                name="x-circle"
                size={16}
                color={isDark ? colors.textMuted : "#94A3B8"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View
        style={[
          styles.filtersWrapper,
          {
            backgroundColor: isDark ? colors.cardBackground : "#FFFFFF",
            borderBottomColor: isDark ? colors.border : "#E2E8F0",
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {getFilterTabs(t).map((item) => {
            const isSelected = selectedFilter === item.id;
            const count =
              item.id === "ALL"
                ? leads.length
                : leads.filter((l) => l.status === item.status).length;

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.75}
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setSelectedFilter(item.id);
                }}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isDark ? colors.surfaceLight : "#F8FAFC",
                    borderColor: isDark ? colors.border : "#E2E8F0",
                  },
                  isSelected && {
                    backgroundColor: isDark ? "#0D9488" : "#0D9488",
                    borderColor: isDark ? "#14B8A6" : "#0D9488",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: isDark ? colors.textSecondary : "#64748B" },
                    isSelected && styles.filterTabTextActive,
                  ]}
                >
                  {item.label}
                </Text>
                <View
                  style={[
                    styles.countPill,
                    {
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.12)"
                        : "#E2E8F0",
                    },
                    isSelected && styles.countPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      { color: isDark ? colors.textPrimary : "#475569" },
                      isSelected && styles.countTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Leads FlatList */}
      <FlatList
        data={filteredLeads}
        keyExtractor={keyExtractor}
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
        renderItem={renderLeadItem}
        ListEmptyComponent={renderEmptyComponent}
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  headerSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: "500",
  },
  filtersWrapper: {
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: "700",
  },
  filterTabTextActive: {
    color: "#FFFFFF",
  },
  countPill: {
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  emptySub: {
    fontSize: 12.5,
    textAlign: "center",
    marginTop: 4,
    maxWidth: "80%",
    lineHeight: 18,
  },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
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

export default MyLeadsScreen;
