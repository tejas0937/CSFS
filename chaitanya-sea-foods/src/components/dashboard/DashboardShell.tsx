"use client";



import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";



import { createVendor, getActiveVendors } from "@/app/actions/vendors";

import { createProduct, deleteProduct, getProductsByVendor, updateProduct } from "@/app/actions/products";

import { completePurchase as completePurchaseAction, completeVendorPurchase, createPurchase, updatePurchase } from "@/app/actions/purchases";

import DashboardFooter from "@/components/dashboard/DashboardFooter";

import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

import DashboardNavigation from "@/components/dashboard/DashboardNavigation";

import PurchaseSection from "@/components/dashboard/purchase/PurchaseSection";

import AddProductModal from "@/components/dashboard/modals/AddProductModal";

import AddVendorModal from "@/components/dashboard/modals/AddVendorModal";

import { GRADE_OPTIONS } from "@/types/dashboard";

import type { DashboardShellProps, Product, Role, Tub, Vendor } from "@/types/dashboard";



export default function DashboardShell({

  userName,

  role,

  purchaseDate,

}: DashboardShellProps) {

  const router = useRouter();

  const [selectedPurchaseDate, setSelectedPurchaseDate] = useState(purchaseDate);



  const [vendors, setVendors] =

    useState<Vendor[]>([]);



  const [selectedVendorId, setSelectedVendorId] =

    useState("");



  const [selectedProductId, setSelectedProductId] =

    useState("");



  const [isLoadingVendors, setIsLoadingVendors] =

    useState(true);



  const [showAddVendorModal, setShowAddVendorModal] =

    useState(false);



  const [isAddingVendor, setIsAddingVendor] =

    useState(false);



  const [newVendorName, setNewVendorName] =

    useState("");



  const [newVendorShipName, setNewVendorShipName] =

    useState("");



  const [newVendorPhone, setNewVendorPhone] =

    useState("");



  const [newVendorLocation, setNewVendorLocation] =

    useState("");



  const [newVendorError, setNewVendorError] =

    useState("");



  const [tubWeight, setTubWeight] =

    useState("");



  const [manualNetWeight, setManualNetWeight] =

    useState(false);



  const [netWeightOverride, setNetWeightOverride] =

    useState("");



  const [purchaseCompleted, setPurchaseCompleted] =

    useState(false);



  const [completedVendors, setCompletedVendors] =

    useState<string[]>([]);



  const [purchaseIds, setPurchaseIds] =

    useState<Record<string, string>>({});



  const [isSavingPurchase, setIsSavingPurchase] =

    useState(false);



  const [purchaseMessage, setPurchaseMessage] =

    useState("");



  const [isNavigatingToUsers, setIsNavigatingToUsers] =

    useState(false);



  const [showAddProductModal, setShowAddProductModal] =

    useState(false);



  const [isAddingProduct, setIsAddingProduct] =

    useState(false);



  const [newProductName, setNewProductName] =

    useState("");



  const [newProductGrade, setNewProductGrade] =

  useState<string>(GRADE_OPTIONS[0]);



  const [newProductCountPerKg, setNewProductCountPerKg] =

    useState("");



  const [newProductError, setNewProductError] =

    useState("");



  const [isSavingProduct, setIsSavingProduct] =

    useState(false);



  const [productMessage, setProductMessage] =

    useState("");



  useEffect(() => {

    let cancelled = false;



    async function loadVendors() {

      setIsLoadingVendors(true);



      try {

        const result = await getActiveVendors();



        if (cancelled) {

          return;

        }



        if (!result.success || result.vendors.length === 0) {

          setVendors([]);

          setSelectedVendorId("");

          setSelectedProductId("");

          setPurchaseIds({});

          setCompletedVendors([]);

          return;

        }



        const databaseVendors: Vendor[] =

          await Promise.all(

            result.vendors.map(async (vendor) => {

              const productsResult =

                await getProductsByVendor(vendor.id);



              const products: Product[] =

                productsResult.success

                  ? productsResult.products.map((product) => ({

                      id: product.id,

                      name: product.name,

                      grade: product.grade,

                      countPerKg: product.countPerKg,

                      tubs: [],

                    }))

                  : [];



              return {

                id: vendor.id,

                name: vendor.name,

                products,

              };

            }),

          );



        if (cancelled) {

          return;

        }



        setVendors(databaseVendors);



        const firstVendor = databaseVendors[0];



        setSelectedVendorId(firstVendor?.id ?? "");

        setSelectedProductId(firstVendor?.products[0]?.id ?? "");

      } catch (error) {

        console.error("Load dashboard data error:", error);

        console.error("Load dashboard data error:", error);



        if (!cancelled) {

          setVendors([]);

          setSelectedVendorId("");

          setSelectedProductId("");

          setPurchaseIds({});

          setCompletedVendors([]);

        }

      } finally {

        if (!cancelled) {

          setIsLoadingVendors(false);

        }

      }

    }



    loadVendors();



    return () => {

      cancelled = true;

    };

  }, []);



  const canCreate =

    role === "ADMIN" ||

    role === "MANAGER";



  const canEditProducts = role === "ADMIN";



  const canOverrideNetWeight =

    role === "ADMIN";



  const selectedVendor = useMemo(

    () =>

      vendors.find(

        (vendor) =>

          vendor.id === selectedVendorId,

      ),

    [vendors, selectedVendorId],

  );



  const selectedProduct = useMemo(

    () =>

      selectedVendor?.products.find(

        (product) =>

          product.id === selectedProductId,

      ),

    [selectedVendor, selectedProductId],

  );



  const currentTubs = useMemo(

    () => selectedProduct?.tubs ?? [],

    [selectedProduct],

  );



  const selectedVendorCompleted =

    selectedVendor

      ? completedVendors.includes(

          selectedVendor.id,

        )

      : false;



  const workspaceFrozen =

    purchaseCompleted ||

    selectedVendorCompleted;



  const totalWeight =

    currentTubs.reduce(

      (total, tub) =>

        total + tub.weight,

      0,

    );



  const calculatedNetWeight =

    totalWeight * 0.95;



  const netWeight =

    manualNetWeight

      ? Number(

          netWeightOverride || 0,

        )

      : calculatedNetWeight;



  const nextTubNumber = useMemo(() => {

    if (currentTubs.length === 0) {

      return 1;

    }



    return (

      Math.max(

        ...currentTubs.map(

          (tub) => tub.number,

        ),

      ) + 1

    );

  }, [currentTubs]);



  async function handleAddVendor() {

    setNewVendorError("");



    if (!newVendorName.trim()) {

      setNewVendorError(

        "Vendor name is required.",

      );

      return;

    }



    if (!newVendorPhone.trim()) {

      setNewVendorError(

        "Phone number is required.",

      );

      return;

    }



    setIsAddingVendor(true);



    try {

      const result = await createVendor({

        name: newVendorName.trim(),

        shipName: newVendorShipName.trim(),

        phone: newVendorPhone.trim(),

        alternatePhone: "",

        location: newVendorLocation.trim(),

        address: "",

        notes: "",

      });



      if (!result.success) {

        setNewVendorError(result.error);

        return;

      }



      const newVendor: Vendor = {

        id: result.vendor.id,

        name: result.vendor.name,

        products: [],

      };



      setVendors((currentVendors) => [

        ...currentVendors,

        newVendor,

      ]);



      setSelectedVendorId(newVendor.id);

      setSelectedProductId("");



      setNewVendorName("");

      setNewVendorShipName("");

      setNewVendorPhone("");

      setNewVendorLocation("");

      setNewVendorError("");



      setShowAddVendorModal(false);

    } catch (error) {

      console.error(

        "Add vendor error:",

        error,

      );



      setNewVendorError(

        "Something went wrong while adding the vendor.",

      );

    } finally {

      setIsAddingVendor(false);

    }

  }



  function openAddProductModal() {

    if (!canCreate || workspaceFrozen) {

      return;

    }



    setNewProductName("");

    setNewProductGrade(GRADE_OPTIONS[0]);

    setNewProductCountPerKg("");

    setNewProductError("");

    setShowAddProductModal(true);

  }



  async function handleAddProduct() {

    setNewProductError("");

    setProductMessage("");



    if (!selectedVendor) {

      setNewProductError("Please select a vendor first.");

      return;

    }



    if (!newProductName.trim()) {

      setNewProductError("Product name is required.");

      return;

    }



    if (!newProductCountPerKg.trim()) {

      setNewProductError("Count per kg is required.");

      return;

    }



    setIsAddingProduct(true);



    try {

      const result = await createProduct({

        vendorId: selectedVendor.id,

        name: newProductName.trim(),

        grade: newProductGrade,

        countPerKg: newProductCountPerKg.trim(),

      });



      if (!result.success) {

        setNewProductError(result.error);

        return;

      }



      const newProduct: Product = {

        id: result.product.id,

        name: result.product.name,

        grade: result.product.grade,

        countPerKg: result.product.countPerKg,

        tubs: [],

      };



      setVendors((current) =>

        current.map((vendor) =>

          vendor.id === selectedVendor.id

            ? {

                ...vendor,

                products: [...vendor.products, newProduct],

              }

            : vendor,

        ),

      );



      setSelectedProductId(newProduct.id);

      setShowAddProductModal(false);

      setProductMessage("Product created successfully.");

    } catch (error) {

      console.error("Add product error:", error);

      setNewProductError(

        "Something went wrong while adding the product.",

      );

    } finally {

      setIsAddingProduct(false);

    }

  }



  function selectVendor(

    vendorId: string,

  ) {

    if (purchaseCompleted) {

      return;

    }



    const vendor =

      vendors.find(

        (item) =>

          item.id === vendorId,

      );



    if (!vendor) {

      return;

    }



    setSelectedVendorId(vendorId);



    setSelectedProductId(

      vendor.products[0]?.id ?? "",

    );



    setManualNetWeight(false);

    setNetWeightOverride("");

  }



  function cancelVendor(

    vendorId: string,

  ) {

    if (purchaseCompleted) {

      return;

    }



    const remainingVendors =

      vendors.filter(

        (vendor) =>

          vendor.id !== vendorId,

      );



    if (

      remainingVendors.length === 0

    ) {

      return;

    }



    setVendors(remainingVendors);



    if (

      selectedVendorId ===

      vendorId

    ) {

      const nextVendor =

        remainingVendors[0];



      setSelectedVendorId(

        nextVendor.id,

      );



      setSelectedProductId(

        nextVendor.products[0]?.id ??

          "",

      );

    }



    setCompletedVendors(

      (current) =>

        current.filter(

          (id) =>

            id !== vendorId,

        ),

    );

  }



  function selectProduct(

    productId: string,

  ) {

    if (workspaceFrozen) {

      return;

    }



    setSelectedProductId(

      productId,

    );



    setManualNetWeight(false);

    setNetWeightOverride("");

  }



  async function cancelProduct(

    productId: string,

  ) {

    if (

      !selectedVendor ||

      workspaceFrozen ||

      role !== "ADMIN"

    ) {

      return;

    }



    setProductMessage("");



    const result = await deleteProduct(productId);



    if (!result.success) {

      setProductMessage(result.error);

      return;

    }



    const remainingProducts = selectedVendor.products.filter(

      (product) => product.id !== productId,

    );



    setVendors((current) =>

      current.map((vendor) =>

        vendor.id === selectedVendor.id

          ? { ...vendor, products: remainingProducts }

          : vendor,

      ),

    );



    if (selectedProductId === productId) {

      setSelectedProductId(remainingProducts[0]?.id ?? "");

    }



    setProductMessage("Product deleted successfully.");

  }



  function updateProductName(

    name: string,

  ) {

    if (

      !selectedVendor ||

      !selectedProduct ||

      workspaceFrozen

    ) {

      return;

    }



    setVendors(

      (current) =>

        current.map(

          (vendor) =>

            vendor.id ===

            selectedVendor.id

              ? {

                  ...vendor,

                  products:

                    vendor.products.map(

                      (product) =>

                        product.id ===

                        selectedProduct.id

                          ? {

                              ...product,

                              name,

                            }

                          : product,

                    ),

                }

              : vendor,

        ),

    );

  }



  function updateGrade(

    grade: string,

  ) {

    if (

      !selectedVendor ||

      !selectedProduct ||

      workspaceFrozen

    ) {

      return;

    }



    setVendors(

      (current) =>

        current.map(

          (vendor) =>

            vendor.id ===

            selectedVendor.id

              ? {

                  ...vendor,

                  products:

                    vendor.products.map(

                      (product) =>

                        product.id ===

                        selectedProduct.id

                          ? {

                              ...product,

                              grade,

                            }

                          : product,

                    ),

                }

              : vendor,

        ),

    );

  }



  function updateCountPerKg(

    countPerKg: string,

  ) {

    if (

      !selectedVendor ||

      !selectedProduct ||

      workspaceFrozen

    ) {

      return;

    }



    setVendors(

      (current) =>

        current.map(

          (vendor) =>

            vendor.id ===

            selectedVendor.id

              ? {

                  ...vendor,

                  products:

                    vendor.products.map(

                      (product) =>

                        product.id ===

                        selectedProduct.id

                          ? {

                              ...product,

                              countPerKg,

                            }

                          : product,

                    ),

                }

              : vendor,

        ),

    );

  }



  function addTub() {

    if (

      !selectedVendor ||

      !selectedProduct ||

      workspaceFrozen

    ) {

      return;

    }



    const weight =

      Number(tubWeight);



    if (

      !Number.isFinite(weight) ||

      weight <= 0

    ) {

      return;

    }



    const newTub: Tub = {

      id: `${selectedProduct.id}-tub-${Date.now()}`,

      number: nextTubNumber,

      weight,

    };



    setVendors(

      (current) =>

        current.map(

          (vendor) =>

            vendor.id ===

            selectedVendor.id

              ? {

                  ...vendor,

                  products:

                    vendor.products.map(

                      (product) =>

                        product.id ===

                        selectedProduct.id

                          ? {

                              ...product,

                              tubs: [

                                ...product.tubs,

                                newTub,

                              ],

                            }

                          : product,

                    ),

                }

              : vendor,

        ),

    );



    if (manualNetWeight) {

      setNetWeightOverride(

        (

          Number(

            netWeightOverride || 0,

          ) +

          weight * 0.95

        ).toFixed(2),

      );

    }



    setTubWeight("");

  }



  function removeTub(

    tubId: string,

  ) {

    if (

      !selectedVendor ||

      !selectedProduct ||

      workspaceFrozen

    ) {

      return;

    }



    setVendors(

      (current) =>

        current.map(

          (vendor) =>

            vendor.id ===

            selectedVendor.id

              ? {

                  ...vendor,

                  products:

                    vendor.products.map(

                      (product) =>

                        product.id ===

                        selectedProduct.id

                          ? {

                              ...product,

                              tubs:

                                product.tubs.filter(

                                  (tub) =>

                                    tub.id !==

                                    tubId,

                                ),

                            }

                          : product,

                    ),

                }

              : vendor,

        ),

    );

  }



  function applyNetWeightOverride() {

    if (

      !canOverrideNetWeight ||

      workspaceFrozen ||

      !netWeightOverride

    ) {

      return;

    }



    const value =

      Number(netWeightOverride);



    if (

      !Number.isFinite(value) ||

      value < 0

    ) {

      return;

    }



    setManualNetWeight(true);

  }



  function resetNetWeight() {

    if (

      !canOverrideNetWeight ||

      workspaceFrozen

    ) {

      return;

    }



    setManualNetWeight(false);

    setNetWeightOverride("");

  }



  async function saveCurrentProduct() {

    if (

      workspaceFrozen ||

      !selectedVendor ||

      !selectedProduct

    ) {

      return;

    }



    setIsSavingPurchase(true);

    setPurchaseMessage("");



    try {

      const vendorTubs = selectedVendor.products.flatMap(

        (product) =>

          product.tubs.map((tub) => ({

            productId: product.id,

            number: tub.number,

            weight: tub.weight,

          })),

      );



      const grossWeight = vendorTubs.reduce(

        (total, tub) => total + tub.weight,

        0,

      );



      const vendorNetWeight =

        manualNetWeight && netWeightOverride

          ? Number(netWeightOverride)

          : grossWeight * 0.95;



      if (!Number.isFinite(vendorNetWeight) || vendorNetWeight < 0) {

        setPurchaseMessage("Please enter a valid net weight.");

        return;

      }



      const existingPurchaseId = purchaseIds[selectedVendor.id];



      const result = existingPurchaseId

        ? await updatePurchase({

            id: existingPurchaseId,

            vendorId: selectedVendor.id,

            purchaseDate: selectedPurchaseDate,
            grossWeight,

            netWeight: vendorNetWeight,

            netWeightOverridden: manualNetWeight,

            vendorCompleted: false,

            completed: false,

            tubs: vendorTubs,

          })

        : await createPurchase({

            vendorId: selectedVendor.id,

            purchaseDate: selectedPurchaseDate,
            grossWeight,

            netWeight: vendorNetWeight,

            netWeightOverridden: manualNetWeight,

            vendorCompleted: false,

            completed: false,

            tubs: vendorTubs,

          });



      if (!result.success) {

        setPurchaseMessage(result.error);

        return;

      }



      setPurchaseIds((current) => ({

        ...current,

        [selectedVendor.id]: result.purchase.id,

      }));



      setPurchaseMessage(

        `Purchase details saved for Vendor ${selectedVendor.name}.`,

      );

    } catch (error) {

      console.error("Save purchase error:", error);

      setPurchaseMessage("Failed to save purchase details.");

    } finally {

      setIsSavingPurchase(false);

    }

  }



  async function completeVendor() {

    if (

      !selectedVendor ||

      purchaseCompleted ||

      selectedVendorCompleted

    ) {

      return;

    }



    setIsSavingPurchase(true);

    setPurchaseMessage("");



    try {

      /* Save the latest local state first. */

      const vendorTubs = selectedVendor.products.flatMap(

        (product) =>

          product.tubs.map((tub) => ({

            productId: product.id,

            number: tub.number,

            weight: tub.weight,

          })),

      );



      const grossWeight = vendorTubs.reduce(

        (total, tub) => total + tub.weight,

        0,

      );



      const vendorNetWeight =

        manualNetWeight && netWeightOverride

          ? Number(netWeightOverride)

          : grossWeight * 0.95;



      const existingPurchaseId = purchaseIds[selectedVendor.id];



      const saveResult = existingPurchaseId

        ? await updatePurchase({

            id: existingPurchaseId,

            vendorId: selectedVendor.id,

            purchaseDate: selectedPurchaseDate,
            grossWeight,

            netWeight: vendorNetWeight,

            netWeightOverridden: manualNetWeight,

            vendorCompleted: false,

            completed: false,

            tubs: vendorTubs,

          })

        : await createPurchase({

            vendorId: selectedVendor.id,

            purchaseDate: selectedPurchaseDate,
            grossWeight,

            netWeight: vendorNetWeight,

            netWeightOverridden: manualNetWeight,

            vendorCompleted: false,

            completed: false,

            tubs: vendorTubs,

          });



      if (!saveResult.success) {

        setPurchaseMessage(saveResult.error);

        return;

      }



      const purchaseId = saveResult.purchase.id;



      const completeResult =

        await completeVendorPurchase(purchaseId);



      if (!completeResult.success) {

        setPurchaseMessage(completeResult.error);

        return;

      }



      setPurchaseIds((current) => ({

        ...current,

        [selectedVendor.id]: purchaseId,

      }));



      setCompletedVendors((current) =>

        current.includes(selectedVendor.id)

          ? current

          : [...current, selectedVendor.id],

      );



      setPurchaseMessage(

        `Vendor ${selectedVendor.name} completed successfully.`,

      );

    } catch (error) {

      console.error("Complete vendor error:", error);

      setPurchaseMessage("Failed to complete vendor purchase.");

    } finally {

      setIsSavingPurchase(false);

    }

  }



  async function completePurchase() {

    if (purchaseCompleted || vendors.length === 0) {

      return;

    }



    const incompleteVendor = vendors.find(

      (vendor) => !completedVendors.includes(vendor.id),

    );



    if (incompleteVendor) {

      setPurchaseMessage(

        `Complete Vendor ${incompleteVendor.name} before completing the purchase.`,

      );

      setSelectedVendorId(incompleteVendor.id);

      setSelectedProductId(incompleteVendor.products[0]?.id ?? "");

      return;

    }



    setIsSavingPurchase(true);

    setPurchaseMessage("");



    try {

      const purchaseIdList = Object.values(purchaseIds);



      if (purchaseIdList.length === 0) {

        setPurchaseMessage("Save at least one vendor purchase first.");

        return;

      }



      for (const purchaseId of purchaseIdList) {

        const result = await completePurchaseAction(purchaseId);



        if (!result.success) {

          setPurchaseMessage(result.error);

          return;

        }

      }



      setPurchaseCompleted(true);

      setPurchaseMessage("Today's purchase completed successfully.");

    } catch (error) {

      console.error("Complete purchase error:", error);

      setPurchaseMessage("Failed to complete today's purchase.");

    } finally {

      setIsSavingPurchase(false);

    }

  }



  function createNewPurchase() {

    setPurchaseCompleted(false);

    setCompletedVendors([]);

    setPurchaseIds({});

    setPurchaseMessage("");



    const firstVendor = vendors[0];



    setSelectedVendorId(firstVendor?.id ?? "");

    setSelectedProductId(firstVendor?.products[0]?.id ?? "");



    setManualNetWeight(false);

    setNetWeightOverride("");

    setTubWeight("");

    setProductMessage("");



    setVendors((current) =>

      current.map((vendor) => ({

        ...vendor,

        products: vendor.products.map((product) => ({

          ...product,

          tubs: [],

        })),

      })),

    );

  }



  function openUserManagement() {

    if (isNavigatingToUsers) {

      return;

    }



    setIsNavigatingToUsers(true);



    router.push("/admin/users/");

  }



  return (

    <main className="min-h-screen overflow-hidden bg-[#fffaf5] text-slate-900">

      <DashboardNavbar userName={userName} role={role} />



      <section id="purchase" className="relative">

        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_10%,rgba(251,146,60,0.10),transparent_28%),radial-gradient(circle_at_90%_60%,rgba(253,186,116,0.10),transparent_30%)]" />

        <div className="mx-auto max-w-7xl px-2 py-3 sm:px-6 lg:px-10 lg:py-6">

          <PurchaseSection

            purchaseDate={selectedPurchaseDate}
            onPurchaseDateChange={setSelectedPurchaseDate}

            canCreate={canCreate}

            canEditProducts={canEditProducts}

            canOverrideNetWeight={canOverrideNetWeight}

            role={role}

            vendors={vendors}

            selectedVendorId={selectedVendorId}

            selectedProductId={selectedProductId}

            selectedVendor={selectedVendor}

            selectedProduct={selectedProduct}

            isLoadingVendors={isLoadingVendors}

            completedVendors={completedVendors}

            purchaseCompleted={purchaseCompleted}

            selectedVendorCompleted={selectedVendorCompleted}

            workspaceFrozen={workspaceFrozen}

            currentTubs={currentTubs}

            totalWeight={totalWeight}

            netWeight={netWeight}

            nextTubNumber={nextTubNumber}

            manualNetWeight={manualNetWeight}

            netWeightOverride={netWeightOverride}

            tubWeight={tubWeight}

            purchaseMessage={purchaseMessage}

            productMessage={productMessage}

            isSavingPurchase={isSavingPurchase}

            isSavingProduct={isSavingProduct}

            setTubWeight={setTubWeight}

            setNetWeightOverride={setNetWeightOverride}

            setNewVendorError={setNewVendorError}

            setShowAddVendorModal={setShowAddVendorModal}

            setNewProductError={setNewProductError}

            setShowAddProductModal={setShowAddProductModal}

            selectVendor={selectVendor}

            cancelVendor={cancelVendor}

            selectProduct={selectProduct}

            cancelProduct={cancelProduct}

            updateProductName={updateProductName}

            updateGrade={updateGrade}

            updateCountPerKg={updateCountPerKg}

            addTub={addTub}

            removeTub={removeTub}

            applyNetWeightOverride={applyNetWeightOverride}

            resetNetWeight={resetNetWeight}

            saveCurrentProduct={saveCurrentProduct}

            completeVendor={completeVendor}

            completePurchase={completePurchase}

            createNewPurchase={createNewPurchase}

            onAddProduct={openAddProductModal}

          />



          <DashboardNavigation

            role={role}

            isNavigatingToUsers={isNavigatingToUsers}

            onManageUsers={openUserManagement}

          />

        </div>

      </section>



      <AddProductModal

        isOpen={showAddProductModal}

        vendorName={selectedVendor?.name}

        productName={newProductName}

        productGrade={newProductGrade}

        countPerKg={newProductCountPerKg}

        error={newProductError}

        isSubmitting={isAddingProduct}

        grades={GRADE_OPTIONS}

        onProductNameChange={setNewProductName}

        onProductGradeChange={setNewProductGrade}

        onCountPerKgChange={setNewProductCountPerKg}

        onClose={() => setShowAddProductModal(false)}

        onSubmit={handleAddProduct}

      />



      <AddVendorModal

        isOpen={showAddVendorModal}

        vendorName={newVendorName}

        shipName={newVendorShipName}

        phone={newVendorPhone}

        location={newVendorLocation}

        error={newVendorError}

        isSubmitting={isAddingVendor}

        onVendorNameChange={setNewVendorName}

        onShipNameChange={setNewVendorShipName}

        onPhoneChange={setNewVendorPhone}

        onLocationChange={setNewVendorLocation}

        onErrorClear={() => setNewVendorError("")}

        onClose={() => setShowAddVendorModal(false)}

        onSubmit={handleAddVendor}

      />



      <DashboardFooter />

    </main>

  );

}
