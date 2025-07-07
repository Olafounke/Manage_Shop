<?php

namespace App\Controller;

use App\Entity\Inventory;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api')]
class InventoryController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('/inventory', name: 'list_inventory', methods: ['GET'])]
    public function listInventory(): JsonResponse
    {
        try {
            $inventory = $this->entityManager
                ->getRepository(Inventory::class)
                ->findAll();

            return $this->json($inventory, 200, [], ['groups' => ['inventory:read']]);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la récupération de l\'inventaire des produits',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/inventory/{id}', name: 'get_inventory_item', methods: ['GET'])]
    public function getInventoryItem(string $id): JsonResponse
    {
        try {
            $inventoryItem = $this->entityManager
                ->getRepository(Inventory::class)
                ->findOneBy([
                    'productId' => $id
                ]);

            if (!$inventoryItem) {
                return $this->json([
                    'message' => 'Inventaire du produit introuvable'
                ], 404);
            }

            return $this->json($inventoryItem, 200, [], ['groups' => ['inventory:read']]);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la récupération de l\'article d\'inventaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/inventory', name: 'create_inventory_item', methods: ['POST'])]
    public function createInventoryItem(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!$data) {
                return $this->json([
                    'message' => 'Données JSON invalides'
                ], 400);
            }

            if (!isset($data['productId'], $data['quantity'])) {
                return $this->json([
                    'message' => 'Les champs productId et quantity sont requis'
                ], 400);
            }

            $existingItem = $this->entityManager
                ->getRepository(Inventory::class)
                ->findOneBy([
                    'productId' => $data['productId']
                ]);

            if ($existingItem) {
                return $this->json([
                    'message' => 'Ce produit existe déjà dans l\'inventaire'
                ], 409);
            }

            $inventoryItem = new Inventory();
            $inventoryItem->setProductId($data['productId']);
            $inventoryItem->setQuantity($data['quantity']);
            
            if (isset($data['productName'])) {
                $inventoryItem->setProductName($data['productName']);
            }

            $errors = $this->validator->validate($inventoryItem);
            if (count($errors) > 0) {
                return $this->json([
                    'message' => 'Erreurs de validation',
                    'errors' => (string) $errors
                ], 400);
            }

            $this->entityManager->persist($inventoryItem);
            $this->entityManager->flush();

            return $this->json($inventoryItem, 201, [], ['groups' => ['inventory:read']]);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la création de l\'article d\'inventaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/inventory/{id}', name: 'update_inventory_item', methods: ['PUT'])]
    public function updateInventoryItem(string $id, Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!$data) {
                return $this->json([
                    'message' => 'Données JSON invalides'
                ], 400);
            }
            
            $inventoryItem = $this->entityManager
                ->getRepository(Inventory::class)
                ->findOneBy([
                    'productId' => $id
                ]);

            if (!$inventoryItem) {
                return $this->json([
                    'message' => 'Inventaire du produit introuvable'
                ], 404);
            }

            if (isset($data['operation'])) {
                switch ($data['operation']) {
                    case 'increment':
                        if (!isset($data['quantity']) || $data['quantity'] <= 0) {
                            return $this->json([
                                'message' => 'Quantité invalide pour l\'incrémentation'
                            ], 400);
                        }
                        $inventoryItem->incrementQuantity($data['quantity']);
                        break;
                        
                    case 'decrement':
                        if (!isset($data['quantity']) || $data['quantity'] <= 0) {
                            return $this->json([
                                'message' => 'Quantité invalide pour la décrémentation'
                            ], 400);
                        }
                        if ($inventoryItem->getQuantity() < $data['quantity']) {
                            return $this->json([
                                'message' => 'Stock insuffisant pour cette opération'
                            ], 400);
                        }
                        $inventoryItem->decrementQuantity($data['quantity']);
                        break;
                        
                    default:
                        return $this->json([
                            'message' => 'Opération non supportée'
                        ], 400);
                }
            } else {
                if (isset($data['quantity'])) {
                    $inventoryItem->setQuantity($data['quantity']);
                }
                
                if (isset($data['productName'])) {
                    $inventoryItem->setProductName($data['productName']);
                }
            }

            $errors = $this->validator->validate($inventoryItem);
            if (count($errors) > 0) {
                return $this->json([
                    'message' => 'Erreurs de validation',
                    'errors' => (string) $errors
                ], 400);
            }

            $this->entityManager->flush();

            return $this->json($inventoryItem, 200, [], ['groups' => ['inventory:read']]);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la mise à jour de l\'article d\'inventaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/inventory/{id}', name: 'delete_inventory_item', methods: ['DELETE'])]
    public function deleteInventoryItem(string $id): JsonResponse
    {
        try {
            $inventoryItem = $this->entityManager
                ->getRepository(Inventory::class)
                ->findOneBy([
                    'productId' => $id
                ]);

            if (!$inventoryItem) {
                return $this->json([
                    'message' => 'Inventaire du produit introuvable'
                ], 404);
            }

            $this->entityManager->remove($inventoryItem);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Article d\'inventaire supprimé avec succès'
            ], 200);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la suppression de l\'article d\'inventaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 