"use client";

import { useState, useTransition, useMemo, useRef, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  RotateCcw,
  Save,
  Loader2,
  Check,
  Plus,
  X,
  Search,
  Utensils,
  ShoppingBag,
  Menu,
  ImageIcon,
  LayoutGrid,
  Upload,
} from "lucide-react";
import { saveLayout, saveLunchOrder, updateImageUrl, uploadMenuImageAction } from "../actions";
import type { AdminMenuItem } from "../../../lib/adminMenus";

// ── 定数 ─────────────────────────────────────────────────────

type Tab = "top" | "lunch" | "menu" | "takeout";

const TABS: { key: Tab; label: string; description: string; field?: keyof AdminMenuItem }[] = [
  { key: "top",     label: "TOPページ",   description: "おすすめメニュー（上位3件が/トップに表示）",       field: "showOnTop" },
  { key: "lunch",   label: "ランチ",      description: "/menu/lunch の表示順（subCategory=ランチ が自動表示）" },
  { key: "menu",    label: "ディナー",    description: "/menu/dinner フード・ドリンク（ランチ除く）",       field: "showOnOfficialMenuPage" },
  { key: "takeout", label: "テイクアウト", description: "/takeout に表示されるメニュー",                   field: "showOnTakeout" },
];

// ランチ判定（subCategory === "ランチ" のアイテムは /menu/lunch に自動表示）
const isLunchItem = (item: AdminMenuItem) => item.subCategory === "ランチ";

const DRINK_ORDER = [
  "生ビール", "瓶ビール", "ハイボール", "サワー", "果実酒",
  "梅酒", "日本酒", "焼酎", "ワイン", "ノンアル", "ソフトドリンク",
];

const CATEGORY_OPTIONS = [
  { value: "",      label: "すべて" },
  { value: "food",  label: "フード" },
  { value: "drink", label: "ドリンク" },
];

// ── メニューページセクション計算 ─────────────────────────────

type MenuSection = { category: "food" | "drink"; subCategory: string; ids: string[] };

function computeMenuSections(
  placedIds: string[],
  itemMap: Map<string, AdminMenuItem>,
): { food: MenuSection[]; drink: MenuSection[] } {
  const foodMap  = new Map<string, string[]>();
  const drinkMap = new Map<string, string[]>();

  for (const id of placedIds) {
    const item = itemMap.get(id);
    if (!item) continue;
    const target = item.category === "food" ? foodMap : drinkMap;
    const list = target.get(item.subCategory) ?? [];
    list.push(id);
    target.set(item.subCategory, list);
  }

  const food = Array.from(foodMap.entries()).map(([subCategory, ids]) => ({
    category: "food" as const, subCategory, ids,
  }));

  const drink = Array.from(drinkMap.entries())
    .sort(([a], [b]) => {
      const ai = DRINK_ORDER.indexOf(a);
      const bi = DRINK_ORDER.indexOf(b);
      return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
    })
    .map(([subCategory, ids]) => ({ category: "drink" as const, subCategory, ids }));

  return { food, drink };
}

function fmtPrice(item: AdminMenuItem): string | null {
  return item.basePrice != null
    ? `¥${Number(item.basePrice).toLocaleString("ja-JP")}〜`
    : null;
}

// ── スマホプレビュー内: TOPカード（ソータブル） ──────────────

function TopSortableCard({
  item, index, onRemove, onSelect,
}: {
  item: AdminMenuItem; index: number; onRemove: () => void; onSelect?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const price = fmtPrice(item);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border overflow-hidden transition-all ${
        isDragging ? "opacity-40 shadow-lg" : "bg-card-bg border-border hover:border-accent/50"
      }`}
    >
      {/* 画像 */}
      <div className="h-24 bg-border/30 relative overflow-hidden">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Utensils size={18} strokeWidth={1.2} className="text-muted/30" />
          </div>
        )}
        {/* 順位 */}
        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-foreground/60 flex items-center justify-center">
          <span className="text-[9px] font-bold text-background/90">{index + 1}</span>
        </div>
      </div>
      {/* テキスト */}
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1.5 mb-0.5">
          <h3 className="font-bold text-foreground text-[11px] leading-snug line-clamp-2">{item.name}</h3>
          {price && <span className="text-[11px] text-accent font-medium shrink-0 tabular-nums">{price}</span>}
        </div>
        {item.description && (
          <p className="text-[10px] text-muted line-clamp-1">{item.description}</p>
        )}
      </div>
      {/* 操作（ホバー） */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onSelect && (
          <button onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="w-7 h-7 flex items-center justify-center bg-indigo-500/80 hover:bg-indigo-600 text-white rounded-full transition-colors"
            aria-label="画像を編集"
          ><ImageIcon size={12} /></button>
        )}
        <button onClick={onRemove}
          className="w-7 h-7 flex items-center justify-center bg-foreground/70 hover:bg-red-500 text-white rounded-full transition-colors"
          aria-label="外す"
        ><X size={13} /></button>
        <button {...attributes} {...listeners}
          className="w-7 h-7 flex items-center justify-center bg-foreground/70 hover:bg-foreground/90 text-white rounded-full cursor-grab active:cursor-grabbing touch-none transition-colors"
          aria-label="ドラッグ"
        ><GripVertical size={13} /></button>
      </div>
    </div>
  );
}

// ── スマホプレビュー内: メニュー行（ソータブル） ─────────────

function MenuSortableRow({
  item, onRemove, onSelect,
}: {
  item: AdminMenuItem; onRemove: () => void; onSelect?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const price = fmtPrice(item);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 px-1 py-2.5 border-b border-border/70 last:border-0 transition-all rounded-lg ${
        isDragging
          ? "opacity-50 bg-accent/10 shadow-md border-transparent"
          : "hover:bg-black/[0.03]"
      }`}
    >
      {/* ドラッグハンドル（常時表示・左端） */}
      <button
        {...attributes}
        {...listeners}
        className="text-muted/25 group-hover:text-muted/60 hover:!text-muted cursor-grab active:cursor-grabbing touch-none transition-colors shrink-0 p-0.5"
        aria-label="ドラッグで並び替え"
      >
        <GripVertical size={17} />
      </button>
      {/* テキスト */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-medium text-foreground text-[13px] leading-snug truncate">
            {item.name}
          </p>
          {isLunchItem(item) && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium shrink-0">ランチ</span>
          )}
        </div>
        {item.description && (
          <p className="text-[11px] text-muted mt-0.5 line-clamp-1">{item.description}</p>
        )}
      </div>
      {/* 価格 */}
      {price && <span className="text-[13px] text-accent font-medium tabular-nums shrink-0">{price}</span>}
      {/* 画像編集ボタン（画像モード時のみ） */}
      {onSelect && (
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="text-muted/20 group-hover:text-indigo-400 hover:!text-indigo-600 transition-colors shrink-0 p-0.5"
          aria-label="画像を編集"
        >
          <ImageIcon size={13} />
        </button>
      )}
      {/* × ボタン（常時表示・右端） */}
      <button
        onClick={onRemove}
        className="text-muted/25 group-hover:text-muted/50 hover:!text-red-500 transition-colors shrink-0 p-0.5"
        aria-label="外す"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ── スマホプレビュー内: ランチ行（ソータブル・削除なし） ────────

function LunchSortableRow({
  item, onSelect,
}: {
  item: AdminMenuItem; onSelect?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const price = fmtPrice(item);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 px-1 py-2.5 border-b border-border/70 last:border-0 transition-all rounded-lg ${
        isDragging
          ? "opacity-50 bg-accent/10 shadow-md border-transparent"
          : "hover:bg-black/[0.03]"
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-muted/25 group-hover:text-muted/60 hover:!text-muted cursor-grab active:cursor-grabbing touch-none transition-colors shrink-0 p-0.5"
        aria-label="ドラッグで並び替え"
      >
        <GripVertical size={17} />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-[13px] leading-snug">{item.name}</p>
        {item.description && (
          <p className="text-[11px] text-muted mt-0.5 line-clamp-1">{item.description}</p>
        )}
      </div>
      {price && <span className="text-[13px] text-accent font-medium tabular-nums shrink-0">{price}</span>}
      {onSelect && (
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="text-muted/20 group-hover:text-indigo-400 hover:!text-indigo-600 transition-colors shrink-0 p-0.5"
          aria-label="画像を編集"
        >
          <ImageIcon size={13} />
        </button>
      )}
    </div>
  );
}

// ── スマホプレビュー内: テイクアウトカード（ソータブル） ──────

function TakeoutSortableCard({
  item, onRemove, onSelect,
}: {
  item: AdminMenuItem; onRemove: () => void; onSelect?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const price = fmtPrice(item);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border px-3 py-2.5 transition-all ${
        isDragging
          ? "opacity-50 shadow-lg border-accent/50 bg-background"
          : "bg-background border-border hover:border-accent/40 hover:shadow-sm"
      }`}
    >
      {/* 上段: ハンドル + ドット + 名前 + 価格 + 画像 + × */}
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="text-muted/25 group-hover:text-muted/60 hover:!text-muted cursor-grab active:cursor-grabbing touch-none transition-colors shrink-0"
          aria-label="ドラッグで並び替え"
        >
          <GripVertical size={17} />
        </button>
        <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
        <h3 className="flex-1 font-bold text-[13px] text-foreground">{item.name}</h3>
        {price && <span className="text-[13px] font-medium text-accent shrink-0 tabular-nums">{price}</span>}
        {onSelect && (
          <button
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className="text-muted/20 group-hover:text-indigo-400 hover:!text-indigo-600 transition-colors shrink-0"
            aria-label="画像を編集"
          >
            <ImageIcon size={13} />
          </button>
        )}
        <button
          onClick={onRemove}
          className="text-muted/25 group-hover:text-muted/50 hover:!text-red-500 transition-colors shrink-0"
          aria-label="外す"
        >
          <X size={13} />
        </button>
      </div>
      {/* 説明文（ある場合のみ） */}
      {item.description && (
        <p className="text-[12px] text-muted mt-1 leading-relaxed line-clamp-2 pl-6">{item.description}</p>
      )}
    </div>
  );
}

// ── DragOverlay コンテンツ ─────────────────────────────────────

function TopOverlay({ item, index }: { item: AdminMenuItem; index: number }) {
  const price = fmtPrice(item);
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden bg-card-bg shadow-2xl rotate-1 scale-105">
      <div className="h-24 bg-border/30 relative overflow-hidden">
        {item.imageUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          : <div className="absolute inset-0 flex items-center justify-center"><Utensils size={18} className="text-muted/30" /></div>
        }
        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-foreground/60 flex items-center justify-center">
          <span className="text-[9px] font-bold text-background/90">{index + 1}</span>
        </div>
      </div>
      <div className="p-2.5">
        <div className="flex items-start justify-between gap-1.5">
          <p className="font-bold text-foreground text-[11px]">{item.name}</p>
          {price && <span className="text-[11px] text-accent shrink-0">{price}</span>}
        </div>
      </div>
    </div>
  );
}

function MenuOverlay({ item }: { item: AdminMenuItem }) {
  const price = fmtPrice(item);
  return (
    <div className="flex items-center justify-between gap-3 py-3.5 px-4 bg-background rounded-xl border border-border/80 shadow-2xl rotate-[0.5deg] scale-[1.02]">
      <p className="font-medium text-foreground text-[13px]">{item.name}</p>
      {price && <span className="text-[13px] text-accent font-medium shrink-0">{price}</span>}
    </div>
  );
}

function TakeoutOverlay({ item }: { item: AdminMenuItem }) {
  const price = fmtPrice(item);
  return (
    <div className="rounded-xl border border-border/80 p-4 flex items-start gap-3 bg-background shadow-2xl rotate-[0.5deg] scale-[1.02]">
      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-bold text-[13px] text-foreground">{item.name}</h3>
          {price && <span className="text-[13px] font-medium text-accent shrink-0">{price}</span>}
        </div>
        {item.description && <p className="text-[12px] text-muted mt-0.5 line-clamp-1">{item.description}</p>}
      </div>
    </div>
  );
}

function LunchOverlay({ item }: { item: AdminMenuItem }) {
  const price = fmtPrice(item);
  return (
    <div className="flex items-center justify-between gap-3 py-3.5 px-4 bg-background rounded-xl border border-amber-200 shadow-2xl rotate-[0.5deg] scale-[1.02]">
      <p className="font-medium text-foreground text-[13px]">{item.name}</p>
      {price && <span className="text-[13px] text-accent font-medium shrink-0">{price}</span>}
    </div>
  );
}

// ── 左パネル: 追加可能アイテム行 ─────────────────────────────

function AvailableRow({ item, onAdd }: { item: AdminMenuItem; onAdd: () => void }) {
  const price = fmtPrice(item);
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-xl hover:bg-slate-50 group transition-all border border-transparent hover:border-slate-200/80">
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt={item.name}
          className="flex-shrink-0 w-9 h-9 rounded-lg object-cover bg-slate-100"
        />
      ) : (
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
          <Utensils size={11} className="text-slate-300" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-slate-900 transition-colors">{item.name}</p>
          {isLunchItem(item) && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium shrink-0">ランチ</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          {item.subCategory && !isLunchItem(item) && (
            <span className="text-[10px] text-slate-400">{item.subCategory}</span>
          )}
          {price && <span className="text-[10px] text-slate-400">· {price}</span>}
        </div>
      </div>
      <button
        onClick={onAdd}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-500 rounded-lg transition-colors"
        aria-label="追加"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}

// ── スマホフレーム内: 空の状態 ────────────────────────────────

function PhoneEmptyState() {
  return (
    <div className="py-16 text-center">
      <p className="text-muted/50 text-sm">まだ表示するメニューがありません</p>
      <p className="text-xs text-muted/35 mt-1.5">左の一覧から + ボタンで追加してください</p>
    </div>
  );
}

// ── スマホフレーム: ページ別コンテンツ ───────────────────────

function PhoneContentTop({
  placedIds,
  itemMap,
  onRemove,
  onSelect,
}: {
  placedIds: string[];
  itemMap: Map<string, AdminMenuItem>;
  onRemove: (id: string) => void;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="px-4 py-8 bg-background min-h-full">
      {/* Section header */}
      <div className="mb-6 text-center">
        <p className="text-[9px] tracking-[0.45em] text-accent/80 mb-1.5">POPULAR</p>
        <h2 className="text-base font-bold text-foreground">人気メニュー</h2>
        <div className="flex items-center justify-center gap-3 mt-2">
          <div className="w-6 h-px bg-accent/50" />
          <div className="w-1 h-1 rounded-full bg-accent/60" />
          <div className="w-6 h-px bg-accent/50" />
        </div>
      </div>
      {placedIds.length === 0 ? (
        <PhoneEmptyState />
      ) : (
        <SortableContext items={placedIds} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-2 gap-3">
            {placedIds.map((id, i) => {
              const item = itemMap.get(id);
              if (!item) return null;
              return (
                <TopSortableCard key={id} item={item} index={i} onRemove={() => onRemove(id)} onSelect={onSelect ? () => onSelect(id) : undefined} />
              );
            })}
          </div>
        </SortableContext>
      )}
      {placedIds.length > 0 && (
        <p className="text-[10px] text-muted/50 text-center mt-4">
          ※ TOPページでは上位3件が「おすすめ」に表示
        </p>
      )}
    </div>
  );
}

function PhoneContentMenu({
  sections,
  itemMap,
  onRemove,
  onSelect,
}: {
  sections: { food: MenuSection[]; drink: MenuSection[] };
  itemMap: Map<string, AdminMenuItem>;
  onRemove: (id: string) => void;
  onSelect?: (id: string) => void;
}) {
  const hasContent = sections.food.length > 0 || sections.drink.length > 0;
  if (!hasContent) {
    return <div className="bg-background min-h-full py-4"><PhoneEmptyState /></div>;
  }
  return (
    <div className="bg-background min-h-full">
      {/* Sticky sub-nav (simplified) */}
      <div className="sticky top-0 z-10 bg-background border-b border-border/50">
        <div className="flex px-2">
          {["フード", "ドリンク"].map((label) => (
            <span key={label} className="flex-1 text-center py-3 text-[11px] text-muted border-b-2 border-transparent">
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* フードセクション */}
      {sections.food.length > 0 && (
        <section className="py-8 px-4 bg-card-bg">
          <div className="mb-5">
            <p className="text-[9px] tracking-[0.45em] text-accent/80 mb-1">FOOD</p>
            <h2 className="text-sm font-bold text-foreground">フード</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-5 h-px bg-accent/50" />
              <div className="w-1 h-1 rounded-full bg-accent/60" />
              <div className="w-5 h-px bg-accent/50" />
            </div>
          </div>
          <div className="space-y-4">
            {sections.food.map((section) => (
              <div key={section.subCategory}>
                <h3 className="text-[9px] tracking-widest text-muted mb-0.5 uppercase">
                  {section.subCategory}
                </h3>
                <div className="bg-background rounded-xl border border-border px-4">
                  <SortableContext items={section.ids} strategy={verticalListSortingStrategy}>
                    {section.ids.map((id) => {
                      const item = itemMap.get(id);
                      if (!item) return null;
                      return (
                        <MenuSortableRow key={id} item={item} onRemove={() => onRemove(id)} onSelect={onSelect ? () => onSelect(id) : undefined} />
                      );
                    })}
                  </SortableContext>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ドリンクセクション */}
      {sections.drink.length > 0 && (
        <section className="py-8 px-4 bg-card-bg border-t border-border/30">
          <div className="mb-5">
            <p className="text-[9px] tracking-[0.45em] text-accent/80 mb-1">DRINK</p>
            <h2 className="text-sm font-bold text-foreground">ドリンク</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-5 h-px bg-accent/50" />
              <div className="w-1 h-1 rounded-full bg-accent/60" />
              <div className="w-5 h-px bg-accent/50" />
            </div>
          </div>
          <div className="space-y-4">
            {sections.drink.map((section) => (
              <div key={section.subCategory}>
                <h3 className="text-[9px] tracking-widest text-muted mb-0.5 uppercase">
                  {section.subCategory}
                </h3>
                <div className="bg-background rounded-xl border border-border px-4">
                  <SortableContext items={section.ids} strategy={verticalListSortingStrategy}>
                    {section.ids.map((id) => {
                      const item = itemMap.get(id);
                      if (!item) return null;
                      return (
                        <MenuSortableRow key={id} item={item} onRemove={() => onRemove(id)} onSelect={onSelect ? () => onSelect(id) : undefined} />
                      );
                    })}
                  </SortableContext>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted/50 mt-4">
            ※ ドリンクのセクション順は固定（生ビール→…）です
          </p>
        </section>
      )}
      {/* ランチ注記 */}
      <div className="px-4 py-3 bg-amber-50/60 border-t border-amber-100/80">
        <p className="text-[10px] text-amber-700/70">
          ランチ（subCategory=ランチ）は /menu/lunch に自動表示・ここには含まれません
        </p>
      </div>
    </div>
  );
}

function PhoneContentTakeout({
  placedIds,
  itemMap,
  onRemove,
  onSelect,
}: {
  placedIds: string[];
  itemMap: Map<string, AdminMenuItem>;
  onRemove: (id: string) => void;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="bg-card-bg min-h-full py-8 px-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-background border border-border/60 flex items-center justify-center shrink-0">
          <ShoppingBag size={15} strokeWidth={1.5} className="text-accent" />
        </div>
        <h2 className="font-bold text-sm text-foreground">テイクアウトメニュー</h2>
      </div>
      {placedIds.length === 0 ? (
        <PhoneEmptyState />
      ) : (
        <SortableContext items={placedIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2.5">
            {placedIds.map((id) => {
              const item = itemMap.get(id);
              if (!item) return null;
              return (
                <TakeoutSortableCard key={id} item={item} onRemove={() => onRemove(id)} onSelect={onSelect ? () => onSelect(id) : undefined} />
              );
            })}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

// ── スマホフレーム: ランチページ ──────────────────────────────

function PhoneContentLunch({
  placedIds,
  itemMap,
  onSelect,
}: {
  placedIds: string[];
  itemMap: Map<string, AdminMenuItem>;
  onSelect?: (id: string) => void;
}) {
  return (
    <div className="bg-background min-h-full">
      {/* ページヘッダー */}
      <div className="py-8 px-4 text-center border-b border-border/50">
        <p className="text-[9px] tracking-[0.45em] text-accent/80 mb-1.5">LUNCH</p>
        <h2 className="text-base font-bold text-foreground">ランチメニュー</h2>
        <p className="text-[10px] text-muted/60 mt-1">12:00〜14:00</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <div className="w-6 h-px bg-accent/50" />
          <div className="w-1 h-1 rounded-full bg-accent/60" />
          <div className="w-6 h-px bg-accent/50" />
        </div>
      </div>
      {/* アイテムリスト */}
      <div className="py-6 px-4">
        {placedIds.length === 0 ? (
          <PhoneEmptyState />
        ) : (
          <SortableContext items={placedIds} strategy={verticalListSortingStrategy}>
            <div className="bg-background rounded-xl border border-border px-4">
              {placedIds.map((id) => {
                const item = itemMap.get(id);
                if (!item) return null;
                return (
                  <LunchSortableRow
                    key={id}
                    item={item}
                    onSelect={onSelect ? () => onSelect(id) : undefined}
                  />
                );
              })}
            </div>
          </SortableContext>
        )}
        <p className="text-[10px] text-amber-600/70 text-center mt-4">
          ※ subCategory=ランチ な全アクティブアイテムが自動表示されます
        </p>
      </div>
    </div>
  );
}

// ── メインコンポーネント ──────────────────────────────────────

interface Props { items: AdminMenuItem[] }

export default function LayoutEditor({ items }: Props) {
  const [activeTab, setActiveTab]       = useState<Tab>("top");
  const [isPending, startTransition]    = useTransition();
  const [saved, setSaved]               = useState(false);
  const [activeId, setActiveId]         = useState<string | null>(null);
  const [leftSearch, setLeftSearch]     = useState("");
  const [leftCategory, setLeftCategory] = useState("");

  // 画像設定モード
  const [viewMode, setViewMode]             = useState<"layout" | "image">("layout");
  const [imageUrlInputs, setImageUrlInputs] = useState<Record<string, string>>({});
  const [imageUrlOverrides, setImageUrlOverrides] = useState<Record<string, string | null>>({});
  const [savingImageId, setSavingImageId]   = useState<string | null>(null);
  const [savedImageIds, setSavedImageIds]   = useState<Set<string>>(new Set());
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const fileInputRef          = useRef<HTMLInputElement>(null);
  const uploadTargetItemRef   = useRef<AdminMenuItem | null>(null);

  // 画像モード用フィルター
  const [imgSearch, setImgSearch]           = useState("");
  const [imgCategory, setImgCategory]       = useState("");
  const [imgTimeFilter, setImgTimeFilter]   = useState<"" | "lunch" | "dinner">("");
  const [imgOnlyUnset, setImgOnlyUnset]     = useState(false);
  const [imgOnlyVisible, setImgOnlyVisible] = useState(false);

  // 画像モード: ハイライト & スクロール
  const [highlightedId, setHighlightedId]   = useState<string | null>(null);
  const imageRowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const [placed, setPlaced] = useState<Record<Tab, string[]>>(() => {
    const sort = (field: keyof AdminMenuItem) =>
      items
        .filter((item) => item[field] === true)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => item.id);
    return {
      top:     sort("showOnTop"),
      // ランチ: subCategory=ランチ の全アクティブアイテム（表示フラグ不要）
      lunch:   items
        .filter((i) => i.isActive && isLunchItem(i))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((i) => i.id),
      // ディナー: showOnOfficialMenuPage=true かつランチ以外
      menu:    items
        .filter((i) => i.showOnOfficialMenuPage && !isLunchItem(i))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((i) => i.id),
      takeout: sort("showOnTakeout"),
    };
  });

  const [committed, setCommitted] = useState(placed);

  const itemMap = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  // imageUrlOverrides を適用した itemMap（プレビューに即時反映）
  const effectiveItemMap = useMemo(
    () => new Map(items.map((item) => [
      item.id,
      item.id in imageUrlOverrides ? { ...item, imageUrl: imageUrlOverrides[item.id] } : item,
    ])),
    [items, imageUrlOverrides],
  );

  // 全タブで表示中の ID セット（placed.lunch にランチが入っているので全タブ統合で OK）
  const allVisibleIds = useMemo(
    () => new Set([...placed.top, ...placed.lunch, ...placed.menu, ...placed.takeout]),
    [placed],
  );

  // 有効な imageUrl（保存済み優先）
  function effectiveImageUrl(item: AdminMenuItem): string | null {
    if (item.id in imageUrlOverrides) return imageUrlOverrides[item.id];
    return item.imageUrl;
  }

  // 画像モード用フィルター済みリスト
  const imageFilteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!item.isActive) return false;
      if (imgCategory && item.category !== imgCategory) return false;
      if (imgTimeFilter === "lunch"  && !isLunchItem(item)) return false;
      if (imgTimeFilter === "dinner" &&  isLunchItem(item)) return false;
      if (imgOnlyUnset && !!effectiveImageUrl(item)) return false;
      if (imgOnlyVisible && !allVisibleIds.has(item.id)) return false;
      if (imgSearch) {
        const q = imgSearch.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.subCategory.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, imgCategory, imgTimeFilter, imgOnlyUnset, imgOnlyVisible, imgSearch, imageUrlOverrides, allVisibleIds]);

  // ハイライト時に左パネルをスクロール
  useEffect(() => {
    if (!highlightedId) return;
    const el = imageRowRefs.current.get(highlightedId);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [highlightedId]);

  // プレビューカードから画像編集へジャンプ
  function handleSelectForImage(id: string) {
    setViewMode("image");
    setImgSearch("");
    setImgCategory("");
    setImgTimeFilter("");
    setImgOnlyUnset(false);
    setImgOnlyVisible(false);
    setHighlightedId(id);
    // 既にハイライト済みの場合も scroll させるため一度リセット
    setTimeout(() => {
      const el = imageRowRefs.current.get(id);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }

  function getImageInput(item: AdminMenuItem): string {
    if (item.id in imageUrlInputs) return imageUrlInputs[item.id];
    if (item.id in imageUrlOverrides) return imageUrlOverrides[item.id] ?? "";
    return item.imageUrl ?? "";
  }

  async function handleSaveImageUrl(item: AdminMenuItem) {
    const url = getImageInput(item).trim();
    setSavingImageId(item.id);
    try {
      await updateImageUrl(item.id, url);
      setImageUrlOverrides((prev) => ({ ...prev, [item.id]: url || null }));
      setSavedImageIds((prev) => new Set([...prev, item.id]));
      setTimeout(() => setSavedImageIds((prev) => { const s = new Set(prev); s.delete(item.id); return s; }), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingImageId(null);
    }
  }

  async function handleUploadFile(file: File, item: AdminMenuItem) {
    setUploadingImageId(item.id);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadMenuImageAction(formData);
      if (!result.ok || !result.imageUrl) {
        console.error(result.error);
        return;
      }
      const imageUrl = result.imageUrl;
      setImageUrlInputs((prev) => ({ ...prev, [item.id]: imageUrl }));
      await updateImageUrl(item.id, imageUrl);
      setImageUrlOverrides((prev) => ({ ...prev, [item.id]: imageUrl }));
      setSavedImageIds((prev) => new Set([...prev, item.id]));
      setTimeout(() => setSavedImageIds((prev) => { const s = new Set(prev); s.delete(item.id); return s; }), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingImageId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const currentPlacedIds = placed[activeTab];
  const isDirty = JSON.stringify(placed[activeTab]) !== JSON.stringify(committed[activeTab]);

  const menuSections = useMemo(
    () => computeMenuSections(placed.menu, itemMap),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [placed.menu, itemMap],
  );

  // 左パネル: 未配置アイテム（ランチタブは表示しない・ディナータブはランチを除外）
  const placedSet = new Set(currentPlacedIds);
  const availableItems = items.filter((item) => {
    if (activeTab === "lunch") return false; // ランチは追加/削除なし
    if (placedSet.has(item.id)) return false;
    if (!item.isActive) return false;
    if (activeTab === "menu" && isLunchItem(item)) return false; // ディナーにランチを追加させない
    if (leftCategory && item.category !== leftCategory) return false;
    if (leftSearch) {
      const q = leftSearch.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.subCategory.toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  const availableFoodItems  = availableItems.filter((item) => item.category === "food");
  const availableDrinkItems = availableItems.filter((item) => item.category === "drink");

  // ── DnD ─────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeStr = String(active.id);
    const overStr   = String(over.id);
    const ids       = placed[activeTab];
    const oldIndex  = ids.indexOf(activeStr);
    const newIndex  = ids.indexOf(overStr);
    if (oldIndex === -1 || newIndex === -1) return;

    // メニュータブ: 同セクション内のみ
    if (activeTab === "menu") {
      const a = itemMap.get(activeStr);
      const o = itemMap.get(overStr);
      if (!a || !o || a.category !== o.category || a.subCategory !== o.subCategory) return;
    }

    setPlaced((prev) => ({
      ...prev,
      [activeTab]: arrayMove(prev[activeTab], oldIndex, newIndex),
    }));
    setSaved(false);
  }

  function handleAdd(id: string) {
    setPlaced((prev) => ({ ...prev, [activeTab]: [...prev[activeTab], id] }));
    setSaved(false);
  }

  function handleRemove(id: string) {
    setPlaced((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((x) => x !== id),
    }));
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      if (activeTab === "lunch") {
        await saveLunchOrder(placed.lunch);
      } else {
        const placedCurrentSet = new Set(placed[activeTab]);
        const removedIds = committed[activeTab].filter((id) => !placedCurrentSet.has(id));
        await saveLayout(activeTab, placed[activeTab], removedIds);
      }
      setCommitted((prev) => ({ ...prev, [activeTab]: [...placed[activeTab]] }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  function handleReset() {
    setPlaced((prev) => ({ ...prev, [activeTab]: [...committed[activeTab]] }));
    setSaved(false);
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setSaved(false);
    setLeftSearch("");
    setLeftCategory("");
  }

  const activeItem  = activeId ? effectiveItemMap.get(activeId) : null;
  const activeIndex = activeId ? currentPlacedIds.indexOf(activeId) : -1;
  const currentTabInfo = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 7.5rem)" }}>
      {/* 画像アップロード用 hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const item = uploadTargetItemRef.current;
          if (file && item) handleUploadFile(file, item);
        }}
      />

      {/* ── ヘッダーバー ──────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900">メニュー管理</h1>
          <p className="text-xs text-slate-400 mt-0.5">{currentTabInfo.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={!isDirty || isPending}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw size={12} />
            元に戻す
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg transition-all shadow-sm ${
              saved
                ? "bg-emerald-500 text-white shadow-emerald-200"
                : isPending
                ? "bg-indigo-400 text-white cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200/60"
            }`}
          >
            {isPending ? <Loader2 size={12} className="animate-spin" />
              : saved ? <Check size={12} />
              : <Save size={12} />}
            {isPending ? "保存中…" : saved ? "保存しました" : "この並びで保存"}
          </button>
        </div>
      </div>

      {/* ── 2カラム ──────────────────────────────────────── */}
      <div className="flex gap-5 flex-1 min-h-0">

        {/* ── 左パネル: ページ選択 + 追加可能メニュー ──── */}
        <div className="w-72 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* モード切替 */}
          <div className="px-3 pt-3 pb-2.5 border-b border-slate-100 flex-shrink-0">
            <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("layout")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "layout" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <LayoutGrid size={11} />レイアウト
              </button>
              <button
                onClick={() => setViewMode("image")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "image" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <ImageIcon size={11} />画像設定
              </button>
            </div>
          </div>

          {/* ページ選択タブ */}
          <div className={`px-4 pt-4 pb-3 border-b border-slate-100 flex-shrink-0 ${viewMode === "image" ? "hidden" : ""}`}>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">表示ページ</p>
            <div className="flex flex-col gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                    activeTab === tab.key
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}>{placed[tab.key].length}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 検索 + フィルター（レイアウトモード・ランチタブ以外） */}
          {viewMode === "layout" && activeTab !== "lunch" && (
            <div className="px-3 pt-3 pb-2 flex-shrink-0">
              <div className="relative mb-2">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={leftSearch}
                  onChange={(e) => setLeftSearch(e.target.value)}
                  placeholder="名前で検索…"
                  className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 placeholder:text-slate-400 transition-colors"
                />
              </div>
              <div className="flex gap-1">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setLeftCategory(opt.value)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      leftCategory === opt.value
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* アイテムリスト（レイアウトモード） */}
          {viewMode === "layout" && (
            <div className="flex-1 overflow-y-auto px-2 py-1">
              {activeTab === "lunch" ? (
                <div className="mx-2 mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
                  <p className="text-[11px] font-semibold text-amber-700 mb-1.5">ランチメニューについて</p>
                  <p className="text-[10px] text-amber-600/80 leading-relaxed">
                    subCategory が「ランチ」のアクティブなメニューが自動的に表示されます。
                  </p>
                  <p className="text-[10px] text-amber-600/80 leading-relaxed mt-1.5">
                    追加・削除はできません。表示順はドラッグで変更できます。
                  </p>
                  <p className="text-[10px] text-amber-600/80 mt-1.5">
                    現在 <span className="font-bold">{placed.lunch.length} 件</span> が表示対象です。
                  </p>
                </div>
              ) : availableItems.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  {leftSearch || leftCategory ? "条件に一致するメニューがありません" : "全メニューが配置済みです"}
                </p>
              ) : (
                <>
                  {availableFoodItems.length > 0 && (
                    <div className="mb-1">
                      <p className="px-2 pt-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        フード · {availableFoodItems.length}件
                      </p>
                      {availableFoodItems.map((item) => (
                        <AvailableRow key={item.id} item={item} onAdd={() => handleAdd(item.id)} />
                      ))}
                    </div>
                  )}
                  {availableDrinkItems.length > 0 && (
                    <div>
                      <p className="px-2 pt-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        ドリンク · {availableDrinkItems.length}件
                      </p>
                      {availableDrinkItems.map((item) => (
                        <AvailableRow key={item.id} item={item} onAdd={() => handleAdd(item.id)} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 画像モード: フィルター */}
          {viewMode === "image" && (
            <div className="px-3 pt-3 pb-2 flex-shrink-0 space-y-2">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={imgSearch}
                  onChange={(e) => setImgSearch(e.target.value)}
                  placeholder="名前で検索…"
                  className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 placeholder:text-slate-400 transition-colors"
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setImgCategory(opt.value)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      imgCategory === opt.value ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 flex-wrap">
                {([
                  { value: "",       label: "全時間帯" },
                  { value: "lunch",  label: "ランチ" },
                  { value: "dinner", label: "ディナー" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setImgTimeFilter(opt.value)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      imgTimeFilter === opt.value
                        ? opt.value === "lunch"  ? "bg-amber-500 text-white"
                        : opt.value === "dinner" ? "bg-slate-700 text-white"
                        :                          "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  onClick={() => setImgOnlyUnset((v) => !v)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    imgOnlyUnset ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  未設定のみ
                </button>
                <button
                  onClick={() => setImgOnlyVisible((v) => !v)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    imgOnlyVisible ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  表示中のみ
                </button>
              </div>
            </div>
          )}

          {/* 画像設定リスト（画像モード） */}
          {viewMode === "image" && (
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
              {imageFilteredItems.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">条件に一致するメニューがありません</p>
              ) : (
                imageFilteredItems.map((item) => {
                  const currentUrl  = getImageInput(item);
                  const isSaving    = savingImageId === item.id;
                  const isSaved     = savedImageIds.has(item.id);
                  const isHighlight = highlightedId === item.id;
                  return (
                    <div
                      key={item.id}
                      ref={(el) => {
                        if (el) imageRowRefs.current.set(item.id, el);
                        else imageRowRefs.current.delete(item.id);
                      }}
                      onClick={() => setHighlightedId(item.id)}
                      className={`rounded-xl border p-2.5 transition-all cursor-pointer ${
                        isHighlight
                          ? "border-indigo-400 bg-indigo-50 shadow-sm shadow-indigo-100"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {currentUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={currentUrl} alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            <Utensils size={12} className="text-slate-300" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 truncate">{item.name}</p>
                          <p className="text-[10px] text-slate-400">
                            {isLunchItem(item) ? "/menu/lunch 自動表示" : item.subCategory}
                          </p>
                        </div>
                        <div className="flex flex-col gap-0.5 items-end shrink-0">
                          {isLunchItem(item) && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">ランチ</span>
                          )}
                          {allVisibleIds.has(item.id) && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-500 font-medium">表示中</span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {/* アップロードボタン（メイン） */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            uploadTargetItemRef.current = item;
                            fileInputRef.current?.click();
                          }}
                          disabled={uploadingImageId === item.id || isSaving}
                          className={`w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                            uploadingImageId === item.id
                              ? "bg-indigo-400 text-white cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white"
                          }`}
                        >
                          {uploadingImageId === item.id
                            ? <><Loader2 size={11} className="animate-spin" />アップロード中…</>
                            : <><Upload size={11} />画像をアップロード</>
                          }
                        </button>
                        {/* URL入力 + 保存（サブ） */}
                        <div className="flex gap-1.5">
                          <input
                            type="url"
                            value={currentUrl}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setImageUrlInputs((prev) => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder="または URL を入力…"
                            className="flex-1 text-[11px] px-2 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 placeholder:text-slate-300 transition-colors min-w-0"
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSaveImageUrl(item); }}
                            disabled={isSaving || uploadingImageId === item.id}
                            className={`flex-shrink-0 flex items-center justify-center w-14 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                              isSaved  ? "bg-emerald-500 text-white" :
                              isSaving ? "bg-indigo-400 text-white cursor-not-allowed" :
                                         "bg-slate-200 hover:bg-slate-300 text-slate-600"
                            }`}
                          >
                            {isSaving ? <Loader2 size={11} className="animate-spin" /> :
                             isSaved  ? <Check size={11} /> : "保存"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div className="px-4 py-2.5 border-t border-slate-100 flex-shrink-0">
            {viewMode === "layout" ? (
              activeTab === "lunch" ? (
                <p className="text-[10px] text-amber-500">
                  ランチ {placed.lunch.length}件 · 並び順のみ保存
                </p>
              ) : (
                <p className="text-[10px] text-slate-400">
                  {availableItems.length}件の未配置メニュー · + で追加
                </p>
              )
            ) : (
              <p className="text-[10px] text-slate-400">
                {items.filter((i) => i.isActive).length}件 · アップロードまたはURLで設定
              </p>
            )}
          </div>
        </div>

        {/* ── 右パネル: スマホプレビュー（カード） ──────── */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-0">

          {/* カードヘッダー */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-semibold text-slate-700">スマホプレビュー</span>
            </div>
            <span className="text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              {currentTabInfo.label}
            </span>
          </div>

          {/* プレビュー本体 */}
          <div className="flex-1 flex items-start justify-center py-6 px-4 bg-slate-50/60 overflow-y-auto">
            {/* スマホフレーム */}
            <div className="w-[375px] flex-shrink-0">
              <div className="rounded-[2.25rem] overflow-hidden shadow-2xl border-[6px] border-slate-800">

                {/* ステータスバー */}
                <div className="bg-slate-900 h-9 flex items-center justify-between px-6">
                  <span className="text-white/60 text-[11px] font-semibold">9:41</span>
                  <div className="w-[88px] h-7 bg-slate-950 rounded-full" />
                  <div className="flex items-center gap-1">
                    <div className="flex gap-[2px] items-end h-3">
                      {[3, 5, 7, 9].map((h, i) => (
                        <div key={i} className="w-1 bg-white/60 rounded-[1px]" style={{ height: `${h}px` }} />
                      ))}
                    </div>
                    <div className="w-4 h-2.5 border border-white/50 rounded-[2px] ml-1 flex items-center px-[2px]">
                      <div className="w-2.5 h-1.5 bg-white/50 rounded-[1px]" />
                    </div>
                  </div>
                </div>

                {/* サイトヘッダー */}
                <div className="h-12 bg-background border-b border-border/40 flex items-center justify-between px-5">
                  <span className="font-bold text-foreground text-sm tracking-wide">きたげん</span>
                  <Menu size={18} strokeWidth={1.5} className="text-foreground/60" />
                </div>

                {/* ページコンテンツ（固定高さ・内部スクロール） */}
                <div className="overflow-y-auto h-[680px]">
                  <DndContext
                    id="layout-editor-dnd"
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    {activeTab === "top" && (
                      <PhoneContentTop
                        placedIds={currentPlacedIds}
                        itemMap={effectiveItemMap}
                        onRemove={handleRemove}
                        onSelect={viewMode === "image" ? handleSelectForImage : undefined}
                      />
                    )}
                    {activeTab === "menu" && (
                      <PhoneContentMenu
                        sections={menuSections}
                        itemMap={effectiveItemMap}
                        onRemove={handleRemove}
                        onSelect={viewMode === "image" ? handleSelectForImage : undefined}
                      />
                    )}
                    {activeTab === "takeout" && (
                      <PhoneContentTakeout
                        placedIds={currentPlacedIds}
                        itemMap={effectiveItemMap}
                        onRemove={handleRemove}
                        onSelect={viewMode === "image" ? handleSelectForImage : undefined}
                      />
                    )}
                    {activeTab === "lunch" && (
                      <PhoneContentLunch
                        placedIds={currentPlacedIds}
                        itemMap={effectiveItemMap}
                        onSelect={viewMode === "image" ? handleSelectForImage : undefined}
                      />
                    )}

                    <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
                      {activeItem && activeTab === "top"     && <TopOverlay     item={activeItem} index={activeIndex} />}
                      {activeItem && activeTab === "menu"    && <MenuOverlay    item={activeItem} />}
                      {activeItem && activeTab === "takeout" && <TakeoutOverlay item={activeItem} />}
                      {activeItem && activeTab === "lunch"   && <LunchOverlay   item={activeItem} />}
                    </DragOverlay>
                  </DndContext>
                </div>

              </div>
            </div>
          </div>

          {/* カードフッター（ヒント） */}
          <div className="px-6 py-2.5 border-t border-slate-100 flex-shrink-0 flex items-center justify-between">
            {viewMode === "image" ? (
              <p className="text-[11px] text-slate-400">
                <ImageIcon size={11} className="inline mr-1 text-indigo-400" />
                アイコンをクリックで左パネルにスクロール
              </p>
            ) : activeTab === "lunch" ? (
              <p className="text-[11px] text-amber-500">
                ドラッグで表示順を変更できます（追加・削除なし）
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                ホバーで ×（外す）と ≡（並び替え）が表示されます
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              sortOrder は全タブ共通
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
