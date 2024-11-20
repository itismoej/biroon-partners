import { Modal } from "@/app/Components/Modal";
import NextImage from "next/image";
import { type FC, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface AddressListProps {
  address?: SearchResultItem;
  setAddress: (address: SearchResultItem | undefined) => void;
}

export interface SearchResultItem {
  title: string;
  address: string;
  neighbourhood?: string; // Optional since it may not always be present
  region: string;
  type: string; // E.g., 'religious', 'street', etc.
  category: "place" | "municipal" | "region"; // Category of the result
  location: {
    x: number; // Longitude
    y: number; // Latitude
  };
}

export interface SearchResult {
  count: number;
  items: SearchResultItem[]; // Array of search result items
}

export const AddressList: FC<AddressListProps> = ({ address, setAddress }) => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult["items"]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Store the timeout reference

  const handleModalOpen = () => setModalOpen(true);
  const handleModalClose = () => {
    setModalOpen(false);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleSearch = async (term: string) => {
    if (!term) return;

    setIsLoading(true);
    try {
      const latLng = "lat=35.699756&lng=51.338076";
      const response = await fetch(`https://api.neshan.org/v1/search?term=${term}&${latLng}`, {
        headers: {
          "Api-Key": "service.af65e25ca7c24b3081d0a330bfbfdf25",
        },
      });
      const data = (await response.json()) as SearchResult;
      setSearchResults(data.items.slice(0, 5));
    } catch {
      toast.error("جستجوی محدوده با خطا مواجه شد", {
        duration: 5000,
        position: "top-center",
      });
    }
    setIsLoading(false);
  };

  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);

    // Clear the previous timeout if the user types again before 2 seconds
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout to trigger the search after 2 seconds of inactivity
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(term);
    }, 1200);
  };

  const handleSelectAddress = (selectedItem: SearchResultItem) => {
    setAddress(selectedItem);
    handleModalClose();
  };

  useEffect(() => {
    // Clean up the timeout when the component unmounts
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {address && (
        <button
          type="button"
          onClick={() => {
            setAddress(undefined);
          }}
          className="absolute z-20 left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
        >
          <NextImage width={20} height={20} src="/cross.svg" alt="بستن" />
        </button>
      )}

      <input
        type="text"
        value={address?.title || "انتخاب محدوده"}
        onClick={handleModalOpen}
        readOnly
        className={`w-full outline-none p-3 ps-10 rounded-md border border-gray-300 text-lg cursor-pointer text-right text-ellipsis ${address?.title ? "font-normal" : "text-gray-500"}`}
      />
      <NextImage
        width={20}
        height={20}
        src="/location.svg"
        alt="Search Icon"
        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
      />
      <Modal isOpen={isModalOpen} onClose={handleModalClose} title="انتخاب محدوده">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchTermChange(e.target.value)} // Debounced search trigger
            placeholder="جستجوی محدوده"
            className="w-full p-3 ps-10 rounded-md border border-gray-300 text-lg text-right outline-none"
          />
          <NextImage
            width={24}
            height={24}
            src="/location.svg"
            alt="Search Icon"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 pointer-events-none"
          />
          {isLoading && (
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none">
              <svg
                aria-hidden="true"
                className="w-6 h-6 text-gray-200 animate-spin fill-black"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            </div>
          )}
        </div>

        {!isLoading && (
          <ul className="list-none p-0 mt-5">
            {searchResults.map((item) => (
              <li
                key={`${item.location.x}${item.location.y}`}
                className="p-2 cursor-pointer flex flex-row items-center gap-3"
                onClick={() => handleSelectAddress(item)}
              >
                <span className="bg-gray-200 rounded-full w-9 h-9 min-w-9 min-h-9 flex items-center justify-center">
                  <NextImage
                    width={20}
                    height={20}
                    src="/location-gray.svg"
                    className="w-5 h-5 min-w-5 min-h-5"
                    alt="مکان"
                  />
                </span>
                <div className="flex flex-col">
                  <p className="text-lg font-normal">{item.title}</p>
                  <p className="text-gray-500">{item.address}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
};
