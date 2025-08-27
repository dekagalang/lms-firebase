import { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { listDocsPaginated, CollectionName } from "@/lib/firestore";

interface PaginationProps<T extends object> {
  collection: CollectionName;
  pageSize?: number;
  filterFn?: (data: T[]) => T[];
  onData: (rows: T[]) => void;
}

export interface PaginationHandle {
  refetch: () => void;
}

function PaginationInner<T extends object>(
  { collection, pageSize = 10, filterFn, onData }: PaginationProps<T>,
  ref: React.Ref<PaginationHandle>
) {
  const [pageCursors, setPageCursors] = useState<
    (QueryDocumentSnapshot<DocumentData> | null)[]
  >([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchRows = async (direction: "first" | "next" | "prev" = "first") => {
    try {
      setLoading(true);

      let cursor: QueryDocumentSnapshot<DocumentData> | undefined;

      if (direction === "next" && pageCursors[pageNumber - 1]) {
        cursor = pageCursors[pageNumber - 1] || undefined;
      } else if (direction === "prev" && pageNumber > 1) {
        cursor = pageCursors[pageNumber - 3] || undefined;
      }

      const { data, lastDoc } = await listDocsPaginated<T>(
        collection,
        pageSize + 1,
        cursor
      );

      const filtered = filterFn ? filterFn(data) : data;

      let hasNext = false;
      let currentPageData = filtered;
      if (filtered.length > pageSize) {
        hasNext = true;
        currentPageData = filtered.slice(0, pageSize);
      }

      onData(currentPageData);

      if (direction === "next") {
        if (hasNext && lastDoc) {
          setPageCursors((prev) => {
            const updated = [...prev];
            updated[pageNumber] = lastDoc;
            return updated;
          });
        }
        setPageNumber((n) => n + 1);
      } else if (direction === "prev") {
        setPageNumber((n) => n - 1);
      } else if (direction === "first") {
        setPageCursors(hasNext && lastDoc ? [lastDoc] : []);
        setPageNumber(1);
      }
    } finally {
      setLoading(false);
    }
  };

  // expose refetch supaya bisa dipanggil dari luar
  useImperativeHandle(ref, () => ({
    refetch: () => fetchRows("first"),
  }));

  // load data pertama kali
  useEffect(() => {
    fetchRows("first");
  }, [collection]);

  return (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => fetchRows("prev")}
        disabled={pageNumber <= 1 || loading}
        className="px-3 py-2 rounded-xl border disabled:opacity-50"
      >
        Prev
      </button>
      <span className="text-sm text-gray-500">
        {loading ? "Loading..." : `Halaman ${pageNumber}`}
      </span>
      <button
        onClick={() => fetchRows("next")}
        disabled={!pageCursors[pageNumber - 1] || loading}
        className="px-3 py-2 rounded-xl border disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

const Pagination = forwardRef(PaginationInner) as <T extends object>(
  p: PaginationProps<T> & { ref?: React.Ref<PaginationHandle> }
) => JSX.Element;

export default Pagination;
