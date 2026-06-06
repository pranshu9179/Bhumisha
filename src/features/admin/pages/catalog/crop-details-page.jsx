// // import { zodResolver } from '@hookform/resolvers/zod'
// // import { Edit2, ImageOff, Images, Plus, RotateCcw, Trash2 } from 'lucide-react'
// // import { useCallback, useEffect, useMemo, useState } from 'react'
// // import { useForm } from 'react-hook-form'
// // import { toast } from 'sonner'
// // import { z } from 'zod'
// // import { DataTable } from '@/components/data-table/data-table'
// // import { StatusBadge } from '@/components/feedback/status-badge'
// // import { Field } from '@/components/forms/field'
// // import { PreviewableImage } from '@/components/media/previewable-image'
// // import { Button } from '@/components/ui/button'
// // import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
// // import { Input } from '@/components/ui/input'
// // import { NativeSelect } from '@/components/ui/native-select'
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// // import { Textarea } from '@/components/ui/textarea'
// // import { PageHeader } from '@/features/shared/components/page-header'
// // import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
// // import { cn } from '@/lib/utils'
// // import { useCropDetailImagesMutation, useCropDetails, useCropDetailSaveMutation, useCropDetailStatusMutation, useProducts } from '@/services/api/hooks'

// // const cropDetailSchema = z.object({
// //   crop_id: z.string().min(1, 'Crop is required'),
// //   title: z.string().trim().min(2, 'English title is required'),
// //   title_hi: z.string().trim().optional(),
// //   description: z.string().trim().min(2, 'English description is required'),
// //   description_hi: z.string().trim().optional(),
// //   sequence: z.string().trim().optional(),
// //   crop_details_theme_image: z.any().optional(),
// // })

// // function fileListToArray(value) {
// //   if (!value) return []
// //   if (typeof FileList !== 'undefined' && value instanceof FileList) return Array.from(value)
// //   return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
// // }

// // function isValidDetailFile(file) {
// //   if (!file) return true
// //   const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4']
// //   return allowedTypes.includes(file.type) && file.size <= 50 * 1024 * 1024
// // }

// // function getMediaUrl(item) {
// //   if (!item) return ''
// //   if (typeof item === 'string') return item
// //   return item.url || item.media_url || item.image_url || item.file_url || item.path || item.file_path || ''
// // }

// // function isVideoMedia(item) {
// //   const url = getMediaUrl(item)
// //   return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
// // }

// // function CropDetailMediaPreview({ item, alt, className = 'h-28 w-full rounded-xl object-cover' }) {
// //   const [failed, setFailed] = useState(false)
// //   const url = getMediaUrl(item)

// //   if (!url) {
// //     return <p className="break-words text-sm text-slate-500">{String(item || '-')}</p>
// //   }

// //   if (failed) {
// //     return (
// //       <a href={url} target="_blank" rel="noreferrer" className="break-words text-sm font-medium text-primary underline">
// //         Open media
// //       </a>
// //     )
// //   }

// //   if (isVideoMedia(item)) {
// //     return <video src={url} className={className} controls muted preload="metadata" onError={() => setFailed(true)} />
// //   }

// //   return <PreviewableImage src={url} alt={alt} className={className} previewTitle={alt} />
// // }

// // function CropDetailMediaStrip({ media = [] }) {
// //   if (!media.length) {
// //     return (
// //       <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
// //         <ImageOff className="h-4 w-4" />
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="flex items-center gap-2">
// //       {media.slice(0, 3).map((item, index) => (
// //         <CropDetailMediaPreview
// //           key={`${getMediaUrl(item) || 'media'}-${index}`}
// //           item={item}
// //           alt={`Crop detail media ${index + 1}`}
// //           className="h-12 w-12 rounded-lg border border-border object-cover"
// //         />
// //       ))}
// //       {media.length > 3 ? <span className="text-xs font-semibold text-slate-500">+{media.length - 3}</span> : null}
// //     </div>
// //   )
// // }

// // function CropDetailDialog({ open, onOpenChange, detail, crops = [] }) {
// //   const mutation = useCropDetailSaveMutation()
// //   const isEditing = Boolean(detail?.id)
// //   const {
// //     register,
// //     handleSubmit,
// //     reset,
// //     formState: { errors },
// //   } = useForm({
// //     resolver: zodResolver(cropDetailSchema),
// //     defaultValues: {
// //       crop_id: '',
// //       title: '',
// //       title_hi: '',
// //       description: '',
// //       description_hi: '',
// //       sequence: '',
// //       crop_details_theme_image: undefined,
// //     },
// //   })

// //   useEffect(() => {
// //     if (!open) return
// //     reset({
// //       crop_id: detail?.cropId ? String(detail.cropId) : '',
// //       title: detail?.title || '',
// //       title_hi: detail?.title_hi || '',
// //       description: detail?.description || '',
// //       description_hi: detail?.description_hi || '',
// //       sequence: detail?.sequence == null ? '' : String(detail.sequence),
// //       crop_details_theme_image: undefined,
// //     })
// //   }, [detail, open, reset])

// //   const onSubmit = async (values) => {
// //     const files = fileListToArray(values.crop_details_theme_image)

// //     if (!isEditing && !files.length) {
// //       toast.error('At least one crop detail image is required.')
// //       return
// //     }

// //     if (files.length > 10) {
// //       toast.error('Upload up to 10 crop detail media files.')
// //       return
// //     }

// //     if (!files.every(isValidDetailFile)) {
// //       toast.error('Use JPEG, JPG, PNG, or MP4 files up to 50MB each.')
// //       return
// //     }

// //     const trimmedSequence = values.sequence?.trim()
// //     if (trimmedSequence && Number.isNaN(Number(trimmedSequence))) {
// //       toast.error('Sequence must be numeric.')
// //       return
// //     }

// //     const payload = {
// //       crop_id: values.crop_id,
// //       title: values.title.trim(),
// //       title_hi: values.title_hi?.trim() || null,
// //       description: values.description.trim(),
// //       description_hi: values.description_hi?.trim() || null,
// //       sequence: trimmedSequence || null,
// //     }

// //     if (files.length) {
// //       payload.crop_details_theme_image = files
// //     }

// //     try {
// //       await mutation.mutateAsync({ id: detail?.id, payload })
// //       toast.success(isEditing ? 'Crop detail updated successfully.' : 'Crop detail created successfully.')
// //       reset()
// //       onOpenChange(false)
// //     } catch (error) {
// //       toast.error(error.displayMessage || 'Unable to save crop detail.')
// //     }
// //   }

// //   return (
// //     <Dialog open={open} onOpenChange={onOpenChange}>
// //       <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
// //         <DialogHeader>
// //           <DialogTitle>{isEditing ? 'Edit crop detail' : 'Add crop detail'}</DialogTitle>
// //           <DialogDescription>Manage crop-linked bilingual detail sections, sequence order, and carousel media.</DialogDescription>
// //         </DialogHeader>
// //         <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
// //           <Field label="Crop" error={errors.crop_id?.message}>
// //             <NativeSelect {...register('crop_id')}>
// //               <option value="">Select crop</option>
// //               {crops.map((crop) => (
// //                 <option key={crop.id} value={crop.id}>
// //                   {crop.name}
// //                   {crop.name_hi ? ` / ${crop.name_hi}` : ''}
// //                 </option>
// //               ))}
// //             </NativeSelect>
// //           </Field>
// //           <Field label="Sequence" hint="Optional unique display order." error={errors.sequence?.message}>
// //             <Input inputMode="numeric" {...register('sequence')} />
// //           </Field>
// //           <Field label="English title" error={errors.title?.message}>
// //             <Input {...register('title')} />
// //           </Field>
// //           <Field label="Hindi title" error={errors.title_hi?.message}>
// //             <Input lang="hi" dir="auto" {...register('title_hi')} />
// //           </Field>
// //           <Field label="English description" error={errors.description?.message} className="md:col-span-2">
// //             <Textarea rows={4} {...register('description')} />
// //           </Field>
// //           <Field label="Hindi description" error={errors.description_hi?.message} className="md:col-span-2">
// //             <Textarea rows={4} lang="hi" dir="auto" {...register('description_hi')} />
// //           </Field>
// //           <Field
// //             label={isEditing ? 'Carousel media' : 'Carousel media required'}
// //             hint={isEditing ? 'Upload only when you want to replace all existing media. Use Manage media to append or remove by index.' : 'Upload 1-10 JPEG, JPG, PNG, or MP4 files.'}
// //             className="md:col-span-2"
// //           >
// //             <Input type="file" multiple accept="image/jpeg,image/png,image/jpg,video/mp4" {...register('crop_details_theme_image')} />
// //           </Field>
// //           <div className="flex justify-end gap-3 md:col-span-2">
// //             <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
// //               Cancel
// //             </Button>
// //             <Button type="submit" disabled={mutation.isPending}>
// //               {mutation.isPending ? 'Saving...' : 'Save crop detail'}
// //             </Button>
// //           </div>
// //         </form>
// //       </DialogContent>
// //     </Dialog>
// //   )
// // }

// // function CropDetailImagesDialog({ detail }) {
// //   const [open, setOpen] = useState(false)
// //   const [files, setFiles] = useState(null)
// //   const [deleteIndexes, setDeleteIndexes] = useState([])
// //   const mutation = useCropDetailImagesMutation()
// //   const media = detail.images || []
// //   const fileCount = fileListToArray(files).length
// //   const remainingCount = media.length - deleteIndexes.length

// //   const handleOpenChange = (nextOpen) => {
// //     setOpen(nextOpen)
// //     if (!nextOpen) {
// //       setFiles(null)
// //       setDeleteIndexes([])
// //     }
// //   }

// //   const toggleDeleteIndex = (index) => {
// //     setDeleteIndexes((items) =>
// //       items.includes(index) ? items.filter((item) => item !== index) : [...items, index],
// //     )
// //   }

// //   const handleUpdateImages = async () => {
// //     const nextFiles = fileListToArray(files)

// //     if (!deleteIndexes.length && !nextFiles.length) {
// //       toast.error('Select media to remove or add new files.')
// //       return
// //     }

// //     if (remainingCount + nextFiles.length > 10) {
// //       toast.error('Crop detail media cannot exceed 10 files.')
// //       return
// //     }

// //     if (!nextFiles.every(isValidDetailFile)) {
// //       toast.error('Use JPEG, JPG, PNG, or MP4 files up to 50MB each.')
// //       return
// //     }

// //     try {
// //       await mutation.mutateAsync({
// //         id: detail.id,
// //         payload: {
// //           deleteIndexes,
// //           crop_details_theme_image: nextFiles,
// //         },
// //       })
// //       toast.success('Crop detail media updated successfully.')
// //       setOpen(false)
// //     } catch (error) {
// //       toast.error(error.displayMessage || 'Unable to update crop detail media.')
// //     }
// //   }

// //   return (
// //     <Dialog open={open} onOpenChange={handleOpenChange}>
// //       <DialogTrigger asChild>
// //         <Button type="button" size="sm" variant="secondary" onClick={(event) => event.stopPropagation()} disabled={detail.status === 'deleted'}>
// //           <Images className="h-4 w-4" />
// //           Media ({media.length})
// //         </Button>
// //       </DialogTrigger>
// //       <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
// //         <DialogHeader>
// //           <DialogTitle>Crop detail media</DialogTitle>
// //           <DialogDescription>Remove selected media by current index and append new files without exceeding 10 total files.</DialogDescription>
// //         </DialogHeader>
// //         <div className="space-y-4">
// //           <Field label="Append media" hint={`${remainingCount + fileCount} of 10 media files after this update.`}>
// //             <Input type="file" multiple accept="image/jpeg,image/png,image/jpg,video/mp4" onChange={(event) => setFiles(event.target.files)} />
// //           </Field>
// //           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
// //             {media.length ? (
// //               media.map((item, index) => {
// //                 const selected = deleteIndexes.includes(index)

// //                 return (
// //                   <button
// //                     key={`${getMediaUrl(item) || 'media'}-${index}`}
// //                     type="button"
// //                     className={cn(
// //                       'rounded-xl border bg-slate-50/80 p-3 text-left transition',
// //                       selected ? 'border-danger ring-4 ring-danger/10' : 'border-border hover:border-primary/40',
// //                     )}
// //                     onClick={() => toggleDeleteIndex(index)}
// //                   >
// //                     <CropDetailMediaPreview item={item} alt={`Crop detail media ${index + 1}`} />
// //                     <span className={cn('mt-2 block text-xs font-semibold', selected ? 'text-danger' : 'text-slate-500')}>
// //                       {selected ? `Remove index ${index}` : `Keep index ${index}`}
// //                     </span>
// //                   </button>
// //                 )
// //               })
// //             ) : (
// //               <p className="text-sm text-slate-500">No media is attached to this crop detail.</p>
// //             )}
// //           </div>
// //           <div className="flex justify-end gap-3">
// //             <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
// //               Cancel
// //             </Button>
// //             <Button type="button" disabled={mutation.isPending} onClick={handleUpdateImages}>
// //               {mutation.isPending ? 'Updating...' : 'Update media'}
// //             </Button>
// //           </div>
// //         </div>
// //       </DialogContent>
// //     </Dialog>
// //   )
// // }

// // function CropDetailStatusButton({ detail }) {
// //   const [open, setOpen] = useState(false)
// //   const mutation = useCropDetailStatusMutation()
// //   const isDeleted = detail.status === 'deleted'

// //   const handleToggle = async (event) => {
// //     event?.stopPropagation?.()
// //     try {
// //       await mutation.mutateAsync(detail.id)
// //       toast.success(isDeleted ? 'Crop detail restored successfully.' : 'Crop detail deleted successfully.')
// //       setOpen(false)
// //     } catch (error) {
// //       toast.error(error.displayMessage || 'Unable to update crop detail status.')
// //     }
// //   }

// //   return (
// //     <Dialog open={open} onOpenChange={setOpen}>
// //       <DialogTrigger asChild>
// //         <Button type="button" size="sm" variant={isDeleted ? 'secondary' : 'danger'} onClick={(event) => event.stopPropagation()}>
// //           {isDeleted ? <RotateCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
// //           {isDeleted ? 'Restore' : 'Delete'}
// //         </Button>
// //       </DialogTrigger>
// //       <DialogContent>
// //         <DialogHeader>
// //           <DialogTitle>{isDeleted ? 'Restore crop detail' : 'Delete crop detail'}</DialogTitle>
// //           <DialogDescription>
// //             {isDeleted
// //               ? `Restore ${detail.title || 'this crop detail'} to the active crop detail list?`
// //               : `Soft delete ${detail.title || 'this crop detail'} from the active crop detail list?`}
// //           </DialogDescription>
// //         </DialogHeader>
// //         <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
// //           <DialogClose asChild>
// //             <Button type="button" variant="secondary" disabled={mutation.isPending}>
// //               Cancel
// //             </Button>
// //           </DialogClose>
// //           <Button type="button" variant={isDeleted ? 'default' : 'danger'} disabled={mutation.isPending} onClick={handleToggle}>
// //             {mutation.isPending ? 'Updating...' : isDeleted ? 'Restore' : 'Delete'}
// //           </Button>
// //         </div>
// //       </DialogContent>
// //     </Dialog>
// //   )
// // }

// // export function CropDetailsPage() {
// //   const [dialogOpen, setDialogOpen] = useState(false)
// //   const [editingDetail, setEditingDetail] = useState(null)
// //   const [cropFilter, setCropFilter] = useState('')
// //   const activeParams = useMemo(() => ({ page: 1, limit: 100, status: 'false' }), [])
// //   const deletedParams = useMemo(() => ({ page: 1, limit: 100, status: 'true' }), [])
// //   const { data: activeDetails = [], isLoading: activeLoading } = useCropDetails(activeParams)
// //   const { data: deletedDetails = [], isLoading: deletedLoading } = useCropDetails(deletedParams)
// //   const { data: crops = [] } = useProducts({ page: 1, limit: 100, status: 'false' })

// //   const cropMap = useMemo(() => Object.fromEntries(crops.map((crop) => [String(crop.id), crop.name])), [crops])
// //   const activeCrops = useMemo(() => crops.filter((crop) => crop.status !== 'deleted'), [crops])
// //   const allDetails = useMemo(() => [...activeDetails, ...deletedDetails], [activeDetails, deletedDetails])
// //   const filterByCrop = useCallback(
// //     (items) =>
// //       cropFilter
// //         ? items.filter((item) => String(item.cropId) === String(cropFilter))
// //         : items,
// //     [cropFilter],
// //   )
// //   const visibleActiveDetails = useMemo(() => filterByCrop(activeDetails), [activeDetails, filterByCrop])
// //   const visibleDeletedDetails = useMemo(() => filterByCrop(deletedDetails), [deletedDetails, filterByCrop])
// //   const visibleAllDetails = useMemo(() => filterByCrop(allDetails), [allDetails, filterByCrop])

// //   const openCreateDialog = () => {
// //     setEditingDetail(null)
// //     setDialogOpen(true)
// //   }

// //   const openEditDialog = useCallback((detail) => {
// //     setEditingDetail(detail)
// //     setDialogOpen(true)
// //   }, [])

// //   const filterSlot = (
// //     <NativeSelect value={cropFilter} onChange={(event) => setCropFilter(event.target.value)} className="max-w-xs">
// //       <option value="">All crops</option>
// //       {activeCrops.map((crop) => (
// //         <option key={crop.id} value={crop.id}>
// //           {crop.name}
// //         </option>
// //       ))}
// //     </NativeSelect>
// //   )

// //   const columns = useMemo(
// //     () => [
// //       {
// //         header: 'Media',
// //         accessorKey: 'images',
// //         enableSorting: false,
// //         cell: ({ row }) => <CropDetailMediaStrip media={row.original.images || []} />,
// //       },
// //       { header: 'Sequence', accessorKey: 'sequence', cell: ({ row }) => row.original.sequence ?? '-' },
// //       { header: 'Title', accessorKey: 'title' },
// //       { header: 'Hindi title', accessorKey: 'title_hi', cell: ({ row }) => row.original.title_hi || '-' },
// //       { header: 'Crop', accessorKey: 'cropId', cell: ({ row }) => cropMap[String(row.original.cropId)] || row.original.cropName || '-' },
// //       { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
// //       {
// //         header: 'Actions',
// //         id: 'actions',
// //         enableSorting: false,
// //         cell: ({ row }) => (
// //           <div className="flex items-center gap-2">
// //             <RecordDetailsDialog
// //               title={`${row.original.title || 'Crop detail'} details`}
// //               description="Crop detail bilingual content, sequence, parent crop, and carousel media references."
// //               record={row.original}
// //               fields={[
// //                 { label: 'ID', value: row.original.id },
// //                 { label: 'Crop', value: cropMap[String(row.original.cropId)] || row.original.cropName },
// //                 { label: 'Sequence', value: row.original.sequence },
// //                 { label: 'English title', value: row.original.title },
// //                 { label: 'Hindi title', value: row.original.title_hi },
// //                 { label: 'English description', value: row.original.description },
// //                 { label: 'Hindi description', value: row.original.description_hi },
// //                 { label: 'Media', value: (row.original.images || []).map(getMediaUrl).join('\n') },
// //                 { label: 'Status', value: row.original.status },
// //                 { label: 'Created', value: row.original.createdAt },
// //                 { label: 'Updated', value: row.original.updatedAt },
// //               ]}
// //             />
// //             <Button
// //               type="button"
// //               size="sm"
// //               variant="secondary"
// //               onClick={(event) => {
// //                 event.stopPropagation()
// //                 openEditDialog(row.original)
// //               }}
// //               disabled={row.original.status === 'deleted'}
// //             >
// //               <Edit2 className="h-4 w-4" />
// //               Edit
// //             </Button>
// //             <CropDetailImagesDialog detail={row.original} />
// //             <CropDetailStatusButton detail={row.original} />
// //           </div>
// //         ),
// //       },
// //     ],
// //     [cropMap, openEditDialog],
// //   )

// //   return (
// //     <div className="space-y-6">
// //       <PageHeader
// //         eyebrow="Crop catalog"
// //         title="Crop details"
// //         description="Create crop detail sections with bilingual content, sequence ordering, and carousel media for each crop."
// //         compact
// //         actions={
// //           <Button onClick={openCreateDialog}>
// //             <Plus className="h-4 w-4" />
// //             Add crop detail
// //           </Button>
// //         }
// //       />

// //       <Tabs defaultValue="active" className="space-y-4">
// //         <TabsList>
// //           <TabsTrigger value="active">Active ({visibleActiveDetails.length})</TabsTrigger>
// //           <TabsTrigger value="deleted">Deleted ({visibleDeletedDetails.length})</TabsTrigger>
// //           <TabsTrigger value="all">All ({visibleAllDetails.length})</TabsTrigger>
// //         </TabsList>
// //         <TabsContent value="active">
// //           <DataTable
// //             columns={columns}
// //             data={visibleActiveDetails}
// //             searchPlaceholder="Search active crop details"
// //             emptyMessage={activeLoading ? 'Loading crop details...' : 'No active crop details found.'}
// //             filterSlot={filterSlot}
// //           />
// //         </TabsContent>
// //         <TabsContent value="deleted">
// //           <DataTable
// //             columns={columns}
// //             data={visibleDeletedDetails}
// //             searchPlaceholder="Search deleted crop details"
// //             emptyMessage={deletedLoading ? 'Loading deleted crop details...' : 'No deleted crop details found.'}
// //             filterSlot={filterSlot}
// //           />
// //         </TabsContent>
// //         <TabsContent value="all">
// //           <DataTable
// //             columns={columns}
// //             data={visibleAllDetails}
// //             searchPlaceholder="Search crop details"
// //             emptyMessage={activeLoading || deletedLoading ? 'Loading crop details...' : 'No crop details found.'}
// //             filterSlot={filterSlot}
// //           />
// //         </TabsContent>
// //       </Tabs>

// //       <CropDetailDialog
// //         key={editingDetail?.id || 'new-crop-detail'}
// //         open={dialogOpen}
// //         onOpenChange={(nextOpen) => {
// //           setDialogOpen(nextOpen)
// //           if (!nextOpen) setEditingDetail(null)
// //         }}
// //         detail={editingDetail}
// //         crops={activeCrops}
// //       />
// //     </div>
// //   )
// // }

// // export default CropDetailsPage




// import { zodResolver } from '@hookform/resolvers/zod'
// import { Edit2, ImageOff, Images, Plus, RotateCcw, Trash2 } from 'lucide-react'
// import { useCallback, useEffect, useMemo, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { toast } from 'sonner'
// import { z } from 'zod'
// import { DataTable } from '@/components/data-table/data-table'
// import { StatusBadge } from '@/components/feedback/status-badge'
// import { Field } from '@/components/forms/field'
// import { PreviewableImage } from '@/components/media/previewable-image'
// import { Button } from '@/components/ui/button'
// import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { NativeSelect } from '@/components/ui/native-select'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Textarea } from '@/components/ui/textarea'
// import { PageHeader } from '@/features/shared/components/page-header'
// import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
// import { cn } from '@/lib/utils'
// import { useCropDetailImagesMutation, useCropDetails, useCropDetailSaveMutation, useCropDetailStatusMutation, useProducts } from '@/services/api/hooks'

// const cropDetailSchema = z.object({
//   crop_id: z.string().min(1, 'Crop is required'),
//   title: z.string().trim().min(2, 'English title is required'),
//   title_hi: z.string().trim().optional(),
//   description: z.string().trim().min(2, 'English description is required'),
//   description_hi: z.string().trim().optional(),
//   sequence: z.string().trim().optional(),
//   crop_details_theme_image: z.any().optional(),
// })

// function fileListToArray(value) {
//   if (!value) return []
//   if (typeof FileList !== 'undefined' && value instanceof FileList) return Array.from(value)
//   return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
// }

// function isValidDetailFile(file) {
//   if (!file) return true
//   const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4']
//   return allowedTypes.includes(file.type) && file.size <= 50 * 1024 * 1024
// }

// function getMediaUrl(item) {
//   if (!item) return ''
//   if (typeof item === 'string') return item
//   return item.url || item.media_url || item.image_url || item.file_url || item.path || item.file_path || ''
// }

// function isVideoMedia(item) {
//   const url = getMediaUrl(item)
//   return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
// }

// function CropDetailMediaPreview({ item, alt, className = 'h-28 w-full rounded-xl object-cover' }) {
//   const [failed, setFailed] = useState(false)
//   const url = getMediaUrl(item)

//   if (!url) {
//     return <p className="break-words text-sm text-slate-500">{String(item || '-')}</p>
//   }

//   if (failed) {
//     return (
//       <a href={url} target="_blank" rel="noreferrer" className="break-words text-sm font-medium text-primary underline">
//         Open media
//       </a>
//     )
//   }

//   if (isVideoMedia(item)) {
//     return <video src={url} className={className} controls muted preload="metadata" onError={() => setFailed(true)} />
//   }

//   return <PreviewableImage src={url} alt={alt} className={className} previewTitle={alt} />
// }

// function CropDetailMediaStrip({ media = [] }) {
//   if (!media.length) {
//     return (
//       <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
//         <ImageOff className="h-4 w-4" />
//       </div>
//     )
//   }

//   return (
//     <div className="flex items-center gap-2">
//       {media.slice(0, 3).map((item, index) => (
//         <CropDetailMediaPreview
//           key={`${getMediaUrl(item) || 'media'}-${index}`}
//           item={item}
//           alt={`Crop detail media ${index + 1}`}
//           className="h-12 w-12 rounded-lg border border-border object-cover"
//         />
//       ))}
//       {media.length > 3 ? <span className="text-xs font-semibold text-slate-500">+{media.length - 3}</span> : null}
//     </div>
//   )
// }

// function CropDetailDialog({ open, onOpenChange, detail, crops = [] }) {
//   const mutation = useCropDetailSaveMutation()
//   const isEditing = Boolean(detail?.id)
//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(cropDetailSchema),
//     defaultValues: {
//       crop_id: '',
//       title: '',
//       title_hi: '',
//       description: '',
//       description_hi: '',
//       sequence: '',
//       crop_details_theme_image: undefined,
//     },
//   })

//   useEffect(() => {
//     if (!open) return
//     reset({
//       crop_id: detail?.cropId ? String(detail.cropId) : '',
//       title: detail?.title || '',
//       title_hi: detail?.title_hi || '',
//       description: detail?.description || '',
//       description_hi: detail?.description_hi || '',
//       sequence: detail?.sequence == null ? '' : String(detail.sequence),
//       crop_details_theme_image: undefined,
//     })
//   }, [detail, open, reset])

//   const onSubmit = async (values) => {
//     const files = fileListToArray(values.crop_details_theme_image)

//     if (!isEditing && !files.length) {
//       toast.error('At least one crop detail image is required.')
//       return
//     }

//     if (files.length > 10) {
//       toast.error('Upload up to 10 crop detail media files.')
//       return
//     }

//     if (!files.every(isValidDetailFile)) {
//       toast.error('Use JPEG, JPG, PNG, or MP4 files up to 50MB each.')
//       return
//     }

//     const trimmedSequence = values.sequence?.trim()
//     if (trimmedSequence && Number.isNaN(Number(trimmedSequence))) {
//       toast.error('Sequence must be numeric.')
//       return
//     }

//     const payload = {
//       crop_id: values.crop_id,
//       title: values.title.trim(),
//       title_hi: values.title_hi?.trim() || null,
//       description: values.description.trim(),
//       description_hi: values.description_hi?.trim() || null,
//       sequence: trimmedSequence || null,
//     }

//     if (files.length) {
//       payload.crop_details_theme_image = files
//     }

//     try {
//       await mutation.mutateAsync({ id: detail?.id, payload })
//       toast.success(isEditing ? 'Crop detail updated successfully.' : 'Crop detail created successfully.')
//       reset()
//       onOpenChange(false)
//     } catch (error) {
//       toast.error(error.displayMessage || 'Unable to save crop detail.')
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
//         <DialogHeader>
//           <DialogTitle>{isEditing ? 'Edit crop detail' : 'Add crop detail'}</DialogTitle>
//           <DialogDescription>Manage crop-linked bilingual detail sections, sequence order, and carousel media.</DialogDescription>
//         </DialogHeader>
//         <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
//           <Field label="Crop" error={errors.crop_id?.message}>
//             <NativeSelect {...register('crop_id')}>
//               <option value="">Select crop</option>
//               {crops.map((crop) => (
//                 <option key={crop.id} value={crop.id}>
//                   {crop.name}
//                   {crop.name_hi ? ` / ${crop.name_hi}` : ''}
//                 </option>
//               ))}
//             </NativeSelect>
//           </Field>
//           <Field label="Sequence" hint="Optional unique display order." error={errors.sequence?.message}>
//             <Input inputMode="numeric" {...register('sequence')} />
//           </Field>
//           <Field label="English title" error={errors.title?.message}>
//             <Input {...register('title')} />
//           </Field>
//           <Field label="Hindi title" error={errors.title_hi?.message}>
//             <Input lang="hi" dir="auto" {...register('title_hi')} />
//           </Field>
//           <Field label="English description" error={errors.description?.message} className="md:col-span-2">
//             <Textarea rows={4} {...register('description')} />
//           </Field>
//           <Field label="Hindi description" error={errors.description_hi?.message} className="md:col-span-2">
//             <Textarea rows={4} lang="hi" dir="auto" {...register('description_hi')} />
//           </Field>
//           <Field
//             label={isEditing ? 'Carousel media' : 'Carousel media required'}
//             hint={isEditing ? 'Upload only when you want to replace all existing media. Use Manage media to append or remove by index.' : 'Upload 1-10 JPEG, JPG, PNG, or MP4 files.'}
//             className="md:col-span-2"
//           >
//             <Input type="file" multiple accept="image/jpeg,image/png,image/jpg,video/mp4" {...register('crop_details_theme_image')} />
//           </Field>
//           <div className="flex justify-end gap-3 md:col-span-2">
//             <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={mutation.isPending}>
//               {mutation.isPending ? 'Saving...' : 'Save crop detail'}
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }

// function CropDetailImagesDialog({ detail }) {
//   const [open, setOpen] = useState(false)
//   const [files, setFiles] = useState(null)
//   const [deleteIndexes, setDeleteIndexes] = useState([])
//   const mutation = useCropDetailImagesMutation()
//   const media = detail.images || []
//   const fileCount = fileListToArray(files).length
//   const remainingCount = media.length - deleteIndexes.length

//   const handleOpenChange = (nextOpen) => {
//     setOpen(nextOpen)
//     if (!nextOpen) {
//       setFiles(null)
//       setDeleteIndexes([])
//     }
//   }

//   const toggleDeleteIndex = (index) => {
//     setDeleteIndexes((items) =>
//       items.includes(index) ? items.filter((item) => item !== index) : [...items, index],
//     )
//   }

//   const handleUpdateImages = async () => {
//     const nextFiles = fileListToArray(files)

//     if (!deleteIndexes.length && !nextFiles.length) {
//       toast.error('Select media to remove or add new files.')
//       return
//     }

//     if (remainingCount + nextFiles.length > 10) {
//       toast.error('Crop detail media cannot exceed 10 files.')
//       return
//     }

//     if (!nextFiles.every(isValidDetailFile)) {
//       toast.error('Use JPEG, JPG, PNG, or MP4 files up to 50MB each.')
//       return
//     }

//     try {
//       await mutation.mutateAsync({
//         id: detail.id,
//         payload: {
//           deleteIndexes,
//           crop_details_theme_image: nextFiles,
//         },
//       })
//       toast.success('Crop detail media updated successfully.')
//       setOpen(false)
//     } catch (error) {
//       toast.error(error.displayMessage || 'Unable to update crop detail media.')
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={handleOpenChange}>
//       <DialogTrigger asChild>
//         <Button type="button" size="sm" variant="secondary" onClick={(event) => event.stopPropagation()} disabled={detail.status === 'deleted'}>
//           <Images className="h-4 w-4" />
//           Media ({media.length})
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
//         <DialogHeader>
//           <DialogTitle>Crop detail media</DialogTitle>
//           <DialogDescription>Remove selected media by current index and append new files without exceeding 10 total files.</DialogDescription>
//         </DialogHeader>
//         <div className="space-y-4">
//           <Field label="Append media" hint={`${remainingCount + fileCount} of 10 media files after this update.`}>
//             <Input type="file" multiple accept="image/jpeg,image/png,image/jpg,video/mp4" onChange={(event) => setFiles(event.target.files)} />
//           </Field>
//           <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {media.length ? (
//               media.map((item, index) => {
//                 const selected = deleteIndexes.includes(index)

//                 return (
//                   <button
//                     key={`${getMediaUrl(item) || 'media'}-${index}`}
//                     type="button"
//                     className={cn(
//                       'rounded-xl border bg-slate-50/80 p-3 text-left transition',
//                       selected ? 'border-danger ring-4 ring-danger/10' : 'border-border hover:border-primary/40',
//                     )}
//                     onClick={() => toggleDeleteIndex(index)}
//                   >
//                     <CropDetailMediaPreview item={item} alt={`Crop detail media ${index + 1}`} />
//                     <span className={cn('mt-2 block text-xs font-semibold', selected ? 'text-danger' : 'text-slate-500')}>
//                       {selected ? `Remove index ${index}` : `Keep index ${index}`}
//                     </span>
//                   </button>
//                 )
//               })
//             ) : (
//               <p className="text-sm text-slate-500">No media is attached to this crop detail.</p>
//             )}
//           </div>
//           <div className="flex justify-end gap-3">
//             <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
//               Cancel
//             </Button>
//             <Button type="button" disabled={mutation.isPending} onClick={handleUpdateImages}>
//               {mutation.isPending ? 'Updating...' : 'Update media'}
//             </Button>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }

// function CropDetailStatusButton({ detail }) {
//   const [open, setOpen] = useState(false)
//   const mutation = useCropDetailStatusMutation()
//   const isDeleted = detail.status === 'deleted'

//   const handleToggle = async (event) => {
//     event?.stopPropagation?.()
//     try {
//       await mutation.mutateAsync(detail.id)
//       toast.success(isDeleted ? 'Crop detail restored successfully.' : 'Crop detail deleted successfully.')
//       setOpen(false)
//     } catch (error) {
//       toast.error(error.displayMessage || 'Unable to update crop detail status.')
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button type="button" size="sm" variant={isDeleted ? 'secondary' : 'danger'} onClick={(event) => event.stopPropagation()}>
//           {isDeleted ? <RotateCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
//           {isDeleted ? 'Restore' : 'Delete'}
//         </Button>
//       </DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>{isDeleted ? 'Restore crop detail' : 'Delete crop detail'}</DialogTitle>
//           <DialogDescription>
//             {isDeleted
//               ? `Restore ${detail.title || 'this crop detail'} to the active crop detail list?`
//               : `Soft delete ${detail.title || 'this crop detail'} from the active crop detail list?`}
//           </DialogDescription>
//         </DialogHeader>
//         <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
//           <DialogClose asChild>
//             <Button type="button" variant="secondary" disabled={mutation.isPending}>
//               Cancel
//             </Button>
//           </DialogClose>
//           <Button type="button" variant={isDeleted ? 'default' : 'danger'} disabled={mutation.isPending} onClick={handleToggle}>
//             {mutation.isPending ? 'Updating...' : isDeleted ? 'Restore' : 'Delete'}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }

// export function CropDetailsPage() {
//   const [dialogOpen, setDialogOpen] = useState(false)
//   const [editingDetail, setEditingDetail] = useState(null)
//   const [cropFilter, setCropFilter] = useState('')
//   const activeParams = useMemo(() => ({ page: 1, limit: 100, status: 'false' }), [])
//   const deletedParams = useMemo(() => ({ page: 1, limit: 100, status: 'true' }), [])
//   const { data: activeDetails = [], isLoading: activeLoading } = useCropDetails(activeParams)
//   const { data: deletedDetails = [], isLoading: deletedLoading } = useCropDetails(deletedParams)
//   const { data: crops = [] } = useProducts({ page: 1, limit: 100, status: 'false' })

//   // Maps cropId → crop name (for the Crop column)
//   const cropMap = useMemo(() => Object.fromEntries(crops.map((crop) => [String(crop.id), crop.name])), [crops])

//   // FIX: Maps cropId → crop theme image (used as fallback when a crop detail has no own media)
//   const cropImageMap = useMemo(
//     () => Object.fromEntries(crops.filter((c) => c.image).map((crop) => [String(crop.id), crop.image])),
//     [crops],
//   )

//   const activeCrops = useMemo(() => crops.filter((crop) => crop.status !== 'deleted'), [crops])
//   const allDetails = useMemo(() => [...activeDetails, ...deletedDetails], [activeDetails, deletedDetails])
//   const filterByCrop = useCallback(
//     (items) =>
//       cropFilter
//         ? items.filter((item) => String(item.cropId) === String(cropFilter))
//         : items,
//     [cropFilter],
//   )
//   const visibleActiveDetails = useMemo(() => filterByCrop(activeDetails), [activeDetails, filterByCrop])
//   const visibleDeletedDetails = useMemo(() => filterByCrop(deletedDetails), [deletedDetails, filterByCrop])
//   const visibleAllDetails = useMemo(() => filterByCrop(allDetails), [allDetails, filterByCrop])

//   const openCreateDialog = () => {
//     setEditingDetail(null)
//     setDialogOpen(true)
//   }

//   const openEditDialog = useCallback((detail) => {
//     setEditingDetail(detail)
//     setDialogOpen(true)
//   }, [])

//   const filterSlot = (
//     <NativeSelect value={cropFilter} onChange={(event) => setCropFilter(event.target.value)} className="max-w-xs">
//       <option value="">All crops</option>
//       {activeCrops.map((crop) => (
//         <option key={crop.id} value={crop.id}>
//           {crop.name}
//         </option>
//       ))}
//     </NativeSelect>
//   )

//   const columns = useMemo(
//     () => [
//       {
//         header: 'Media',
//         accessorKey: 'images',
//         enableSorting: false,
//         // FIX: if the crop detail has no own carousel media, fall back to the parent crop's theme image
//         cell: ({ row }) => {
//           const detailMedia = row.original.images || []
//           const cropFallback = cropImageMap[String(row.original.cropId)]
//           const media = detailMedia.length > 0 ? detailMedia : cropFallback ? [cropFallback] : []
//           return <CropDetailMediaStrip media={media} />
//         },
//       },
//       { header: 'Sequence', accessorKey: 'sequence', cell: ({ row }) => row.original.sequence ?? '-' },
//       { header: 'Title', accessorKey: 'title' },
//       { header: 'Hindi title', accessorKey: 'title_hi', cell: ({ row }) => row.original.title_hi || '-' },
//       { header: 'Crop', accessorKey: 'cropId', cell: ({ row }) => cropMap[String(row.original.cropId)] || row.original.cropName || '-' },
//       { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
//       {
//         header: 'Actions',
//         id: 'actions',
//         enableSorting: false,
//         cell: ({ row }) => (
//           <div className="flex items-center gap-2">
//             <RecordDetailsDialog
//               title={`${row.original.title || 'Crop detail'} details`}
//               description="Crop detail bilingual content, sequence, parent crop, and carousel media references."
//               record={row.original}
//               fields={[
//                 { label: 'ID', value: row.original.id },
//                 { label: 'Crop', value: cropMap[String(row.original.cropId)] || row.original.cropName },
//                 { label: 'Sequence', value: row.original.sequence },
//                 { label: 'English title', value: row.original.title },
//                 { label: 'Hindi title', value: row.original.title_hi },
//                 { label: 'English description', value: row.original.description },
//                 { label: 'Hindi description', value: row.original.description_hi },
//                 { label: 'Media', value: (row.original.images || []).map(getMediaUrl).join('\n') },
//                 { label: 'Status', value: row.original.status },
//                 { label: 'Created', value: row.original.createdAt },
//                 { label: 'Updated', value: row.original.updatedAt },
//               ]}
//             />
//             <Button
//               type="button"
//               size="sm"
//               variant="secondary"
//               onClick={(event) => {
//                 event.stopPropagation()
//                 openEditDialog(row.original)
//               }}
//               disabled={row.original.status === 'deleted'}
//             >
//               <Edit2 className="h-4 w-4" />
//               Edit
//             </Button>
//             <CropDetailImagesDialog detail={row.original} />
//             <CropDetailStatusButton detail={row.original} />
//           </div>
//         ),
//       },
//     ],
//     [cropMap, cropImageMap, openEditDialog], // FIX: added cropImageMap to deps
//   )

//   return (
//     <div className="space-y-6">
//       <PageHeader
//         eyebrow="Crop catalog"
//         title="Crop details"
//         description="Create crop detail sections with bilingual content, sequence ordering, and carousel media for each crop."
//         compact
//         actions={
//           <Button onClick={openCreateDialog}>
//             <Plus className="h-4 w-4" />
//             Add crop detail
//           </Button>
//         }
//       />

//       <Tabs defaultValue="active" className="space-y-4">
//         <TabsList>
//           <TabsTrigger value="active">Active ({visibleActiveDetails.length})</TabsTrigger>
//           <TabsTrigger value="deleted">Deleted ({visibleDeletedDetails.length})</TabsTrigger>
//           <TabsTrigger value="all">All ({visibleAllDetails.length})</TabsTrigger>
//         </TabsList>
//         <TabsContent value="active">
//           <DataTable
//             columns={columns}
//             data={visibleActiveDetails}
//             searchPlaceholder="Search active crop details"
//             emptyMessage={activeLoading ? 'Loading crop details...' : 'No active crop details found.'}
//             filterSlot={filterSlot}
//           />
//         </TabsContent>
//         <TabsContent value="deleted">
//           <DataTable
//             columns={columns}
//             data={visibleDeletedDetails}
//             searchPlaceholder="Search deleted crop details"
//             emptyMessage={deletedLoading ? 'Loading deleted crop details...' : 'No deleted crop details found.'}
//             filterSlot={filterSlot}
//           />
//         </TabsContent>
//         <TabsContent value="all">
//           <DataTable
//             columns={columns}
//             data={visibleAllDetails}
//             searchPlaceholder="Search crop details"
//             emptyMessage={activeLoading || deletedLoading ? 'Loading crop details...' : 'No crop details found.'}
//             filterSlot={filterSlot}
//           />
//         </TabsContent>
//       </Tabs>

//       <CropDetailDialog
//         key={editingDetail?.id || 'new-crop-detail'}
//         open={dialogOpen}
//         onOpenChange={(nextOpen) => {
//           setDialogOpen(nextOpen)
//           if (!nextOpen) setEditingDetail(null)
//         }}
//         detail={editingDetail}
//         crops={activeCrops}
//       />
//     </div>
//   )
// }

// export default CropDetailsPage


import { zodResolver } from '@hookform/resolvers/zod'
import { Edit2, ImageOff, Images, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { DataTable } from '@/components/data-table/data-table'
import { StatusBadge } from '@/components/feedback/status-badge'
import { Field } from '@/components/forms/field'
import { PreviewableImage } from '@/components/media/previewable-image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/features/shared/components/page-header'
import { RecordDetailsDialog } from '@/features/shared/components/record-details-dialog'
import { cn } from '@/lib/utils'
import { useCropDetailImagesMutation, useCropDetails, useCropDetailSaveMutation, useCropDetailStatusMutation, useProducts } from '@/services/api/hooks'

const cropDetailSchema = z.object({
  crop_id: z.string().min(1, 'Crop is required'),
  title: z.string().trim().min(2, 'English title is required'),
  title_hi: z.string().trim().optional(),
  description: z.string().trim().min(2, 'English description is required'),
  description_hi: z.string().trim().optional(),
  sequence: z.string().trim().optional(),
  crop_details_theme_image: z.any().optional(),
})

function fileListToArray(value) {
  if (!value) return []
  if (typeof FileList !== 'undefined' && value instanceof FileList) return Array.from(value)
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean)
}

function isValidDetailFile(file) {
  if (!file) return true
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4']
  return allowedTypes.includes(file.type) && file.size <= 50 * 1024 * 1024
}

function getMediaUrl(item) {
  if (!item) return ''
  if (typeof item === 'string') return item
  return item.url || item.media_url || item.image_url || item.file_url || item.path || item.file_path || ''
}

function isVideoMedia(item) {
  const url = getMediaUrl(item)
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
}

function CropDetailMediaPreview({ item, alt, className = 'h-28 w-full rounded-xl object-cover' }) {
  const [failed, setFailed] = useState(false)
  const url = getMediaUrl(item)

  if (!url) {
    return <p className="break-words text-sm text-slate-500">{String(item || '-')}</p>
  }

  if (failed) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="break-words text-sm font-medium text-primary underline">
        Open media
      </a>
    )
  }

  if (isVideoMedia(item)) {
    return <video src={url} className={className} controls muted preload="metadata" onError={() => setFailed(true)} />
  }

  return <PreviewableImage src={url} alt={alt} className={className} previewTitle={alt} />
}

function CropDetailMediaStrip({ media = [] }) {
  if (!media.length) {
    return (
      <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
        <ImageOff className="h-4 w-4" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {media.slice(0, 3).map((item, index) => (
        <CropDetailMediaPreview
          key={`${getMediaUrl(item) || 'media'}-${index}`}
          item={item}
          alt={`Crop detail media ${index + 1}`}
          className="h-12 w-12 rounded-lg border border-border object-cover"
        />
      ))}
      {media.length > 3 ? <span className="text-xs font-semibold text-slate-500">+{media.length - 3}</span> : null}
    </div>
  )
}

function CropDetailDialog({ open, onOpenChange, detail, crops = [] }) {
  const mutation = useCropDetailSaveMutation()
  const isEditing = Boolean(detail?.id)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cropDetailSchema),
    defaultValues: {
      crop_id: '',
      title: '',
      title_hi: '',
      description: '',
      description_hi: '',
      sequence: '',
      crop_details_theme_image: undefined,
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      crop_id: detail?.cropId ? String(detail.cropId) : '',
      title: detail?.title || '',
      title_hi: detail?.title_hi || '',
      description: detail?.description || '',
      description_hi: detail?.description_hi || '',
      sequence: detail?.sequence == null ? '' : String(detail.sequence),
      crop_details_theme_image: undefined,
    })
  }, [detail, open, reset])

  const onSubmit = async (values) => {
    const files = fileListToArray(values.crop_details_theme_image)

    if (!isEditing && !files.length) {
      toast.error('At least one crop detail image is required.')
      return
    }

    if (files.length > 10) {
      toast.error('Upload up to 10 crop detail media files.')
      return
    }

    if (!files.every(isValidDetailFile)) {
      toast.error('Use JPEG, JPG, PNG, or MP4 files up to 50MB each.')
      return
    }

    const trimmedSequence = values.sequence?.trim()
    if (trimmedSequence && Number.isNaN(Number(trimmedSequence))) {
      toast.error('Sequence must be numeric.')
      return
    }

    const payload = {
      crop_id: values.crop_id,
      title: values.title.trim(),
      title_hi: values.title_hi?.trim() || null,
      description: values.description.trim(),
      description_hi: values.description_hi?.trim() || null,
      sequence: trimmedSequence || null,
    }

    if (files.length) {
      payload.crop_details_theme_image = files
    }

    try {
      await mutation.mutateAsync({ id: detail?.id, payload })
      toast.success(isEditing ? 'Crop detail updated successfully.' : 'Crop detail created successfully.')
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to save crop detail.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit crop detail' : 'Add crop detail'}</DialogTitle>
          <DialogDescription>Manage crop-linked bilingual detail sections, sequence order, and carousel media.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Crop" error={errors.crop_id?.message}>
            <NativeSelect {...register('crop_id')}>
              <option value="">Select crop</option>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                  {crop.name_hi ? ` / ${crop.name_hi}` : ''}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Sequence" hint="Optional unique display order." error={errors.sequence?.message}>
            <Input inputMode="numeric" {...register('sequence')} />
          </Field>
          <Field label="English title" error={errors.title?.message}>
            <Input {...register('title')} />
          </Field>
          <Field label="Hindi title" error={errors.title_hi?.message}>
            <Input lang="hi" dir="auto" {...register('title_hi')} />
          </Field>
          <Field label="English description" error={errors.description?.message} className="md:col-span-2">
            <Textarea rows={4} {...register('description')} />
          </Field>
          <Field label="Hindi description" error={errors.description_hi?.message} className="md:col-span-2">
            <Textarea rows={4} lang="hi" dir="auto" {...register('description_hi')} />
          </Field>
          <Field
            label={isEditing ? 'Carousel media' : 'Carousel media required'}
            hint={isEditing ? 'Upload only when you want to replace all existing media. Use Manage media to append or remove by index.' : 'Upload 1-10 JPEG, JPG, PNG, or MP4 files.'}
            className="md:col-span-2"
          >
            <Input type="file" multiple accept="image/jpeg,image/png,image/jpg,video/mp4" {...register('crop_details_theme_image')} />
          </Field>
          <div className="flex justify-end gap-3 md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save crop detail'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CropDetailImagesDialog({ detail, cropFallbackImage }) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState(null)
  const [deleteIndexes, setDeleteIndexes] = useState([])
  const mutation = useCropDetailImagesMutation()
  const media = detail.images || []
  const fileCount = fileListToArray(files).length
  const remainingCount = media.length - deleteIndexes.length

  const handleOpenChange = (nextOpen) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setFiles(null)
      setDeleteIndexes([])
    }
  }

  const toggleDeleteIndex = (index) => {
    setDeleteIndexes((items) =>
      items.includes(index) ? items.filter((item) => item !== index) : [...items, index],
    )
  }

  const handleUpdateImages = async () => {
    const nextFiles = fileListToArray(files)

    if (!deleteIndexes.length && !nextFiles.length) {
      toast.error('Select media to remove or add new files.')
      return
    }

    if (remainingCount + nextFiles.length > 10) {
      toast.error('Crop detail media cannot exceed 10 files.')
      return
    }

    if (!nextFiles.every(isValidDetailFile)) {
      toast.error('Use JPEG, JPG, PNG, or MP4 files up to 50MB each.')
      return
    }

    try {
      await mutation.mutateAsync({
        id: detail.id,
        payload: {
          deleteIndexes,
          crop_details_theme_image: nextFiles,
        },
      })
      toast.success('Crop detail media updated successfully.')
      setOpen(false)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to update crop detail media.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="secondary" onClick={(event) => event.stopPropagation()} disabled={detail.status === 'deleted'}>
          <Images className="h-4 w-4" />
          Media ({media.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Crop detail media</DialogTitle>
          <DialogDescription>Remove selected media by current index and append new files without exceeding 10 total files.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Append media" hint={`${remainingCount + fileCount} of 10 media files after this update.`}>
            <Input type="file" multiple accept="image/jpeg,image/png,image/jpg,video/mp4" onChange={(event) => setFiles(event.target.files)} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {media.length ? (
              media.map((item, index) => {
                const selected = deleteIndexes.includes(index)

                return (
                  <button
                    key={`${getMediaUrl(item) || 'media'}-${index}`}
                    type="button"
                    className={cn(
                      'rounded-xl border bg-slate-50/80 p-3 text-left transition',
                      selected ? 'border-danger ring-4 ring-danger/10' : 'border-border hover:border-primary/40',
                    )}
                    onClick={() => toggleDeleteIndex(index)}
                  >
                    <CropDetailMediaPreview item={item} alt={`Crop detail media ${index + 1}`} />
                    <span className={cn('mt-2 block text-xs font-semibold', selected ? 'text-danger' : 'text-slate-500')}>
                      {selected ? `Remove index ${index}` : `Keep index ${index}`}
                    </span>
                  </button>
                )
              })
            ) : cropFallbackImage ? (
              // No carousel media uploaded yet — show the parent crop's image as a read-only reference
              <div className="rounded-xl border border-dashed border-border bg-slate-50/80 p-3">
                <CropDetailMediaPreview item={cropFallbackImage} alt="Parent crop image" />
                <span className="mt-2 block text-xs font-semibold text-slate-400">
                  Parent crop image · upload carousel media above to replace
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No media is attached to this crop detail.</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={mutation.isPending} onClick={handleUpdateImages}>
              {mutation.isPending ? 'Updating...' : 'Update media'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CropDetailStatusButton({ detail }) {
  const [open, setOpen] = useState(false)
  const mutation = useCropDetailStatusMutation()
  const isDeleted = detail.status === 'deleted'

  const handleToggle = async (event) => {
    event?.stopPropagation?.()
    try {
      await mutation.mutateAsync(detail.id)
      toast.success(isDeleted ? 'Crop detail restored successfully.' : 'Crop detail deleted successfully.')
      setOpen(false)
    } catch (error) {
      toast.error(error.displayMessage || 'Unable to update crop detail status.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant={isDeleted ? 'secondary' : 'danger'} onClick={(event) => event.stopPropagation()}>
          {isDeleted ? <RotateCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
          {isDeleted ? 'Restore' : 'Delete'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isDeleted ? 'Restore crop detail' : 'Delete crop detail'}</DialogTitle>
          <DialogDescription>
            {isDeleted
              ? `Restore ${detail.title || 'this crop detail'} to the active crop detail list?`
              : `Soft delete ${detail.title || 'this crop detail'} from the active crop detail list?`}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={mutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" variant={isDeleted ? 'default' : 'danger'} disabled={mutation.isPending} onClick={handleToggle}>
            {mutation.isPending ? 'Updating...' : isDeleted ? 'Restore' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CropDetailsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDetail, setEditingDetail] = useState(null)
  const [cropFilter, setCropFilter] = useState('')
  const activeParams = useMemo(() => ({ page: 1, limit: 100, status: 'false' }), [])
  const deletedParams = useMemo(() => ({ page: 1, limit: 100, status: 'true' }), [])
  const { data: activeDetails = [], isLoading: activeLoading } = useCropDetails(activeParams)
  const { data: deletedDetails = [], isLoading: deletedLoading } = useCropDetails(deletedParams)
  const { data: crops = [] } = useProducts({ page: 1, limit: 100, status: 'false' })

  // Maps cropId → crop name (for the Crop column)
  const cropMap = useMemo(() => Object.fromEntries(crops.map((crop) => [String(crop.id), crop.name])), [crops])

  // FIX: Maps cropId → crop theme image (used as fallback when a crop detail has no own media)
  const cropImageMap = useMemo(
    () => Object.fromEntries(crops.filter((c) => c.image).map((crop) => [String(crop.id), crop.image])),
    [crops],
  )

  const activeCrops = useMemo(() => crops.filter((crop) => crop.status !== 'deleted'), [crops])
  const allDetails = useMemo(() => [...activeDetails, ...deletedDetails], [activeDetails, deletedDetails])
  const filterByCrop = useCallback(
    (items) =>
      cropFilter
        ? items.filter((item) => String(item.cropId) === String(cropFilter))
        : items,
    [cropFilter],
  )
  const visibleActiveDetails = useMemo(() => filterByCrop(activeDetails), [activeDetails, filterByCrop])
  const visibleDeletedDetails = useMemo(() => filterByCrop(deletedDetails), [deletedDetails, filterByCrop])
  const visibleAllDetails = useMemo(() => filterByCrop(allDetails), [allDetails, filterByCrop])

  const openCreateDialog = () => {
    setEditingDetail(null)
    setDialogOpen(true)
  }

  const openEditDialog = useCallback((detail) => {
    setEditingDetail(detail)
    setDialogOpen(true)
  }, [])

  const filterSlot = (
    <NativeSelect value={cropFilter} onChange={(event) => setCropFilter(event.target.value)} className="max-w-xs">
      <option value="">All crops</option>
      {activeCrops.map((crop) => (
        <option key={crop.id} value={crop.id}>
          {crop.name}
        </option>
      ))}
    </NativeSelect>
  )

  const columns = useMemo(
    () => [
      {
        header: 'Media',
        accessorKey: 'images',
        enableSorting: false,
        // FIX: if the crop detail has no own carousel media, fall back to the parent crop's theme image
        cell: ({ row }) => {
          const detailMedia = row.original.images || []
          const cropFallback = cropImageMap[String(row.original.cropId)]
          const media = detailMedia.length > 0 ? detailMedia : cropFallback ? [cropFallback] : []
          return <CropDetailMediaStrip media={media} />
        },
      },
      { header: 'Sequence', accessorKey: 'sequence', cell: ({ row }) => row.original.sequence ?? '-' },
      { header: 'Title', accessorKey: 'title' },
      { header: 'Hindi title', accessorKey: 'title_hi', cell: ({ row }) => row.original.title_hi || '-' },
      { header: 'Crop', accessorKey: 'cropId', cell: ({ row }) => cropMap[String(row.original.cropId)] || row.original.cropName || '-' },
      { header: 'Status', accessorKey: 'status', cell: ({ row }) => <StatusBadge value={row.original.status} /> },
      {
        header: 'Actions',
        id: 'actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <RecordDetailsDialog
              title={`${row.original.title || 'Crop detail'} details`}
              description="Crop detail bilingual content, sequence, parent crop, and carousel media references."
              record={row.original}
              fields={[
                { label: 'ID', value: row.original.id },
                { label: 'Crop', value: cropMap[String(row.original.cropId)] || row.original.cropName },
                { label: 'Sequence', value: row.original.sequence },
                { label: 'English title', value: row.original.title },
                { label: 'Hindi title', value: row.original.title_hi },
                { label: 'English description', value: row.original.description },
                { label: 'Hindi description', value: row.original.description_hi },
                { label: 'Media', value: (row.original.images || []).map(getMediaUrl).join('\n') },
                { label: 'Status', value: row.original.status },
                { label: 'Created', value: row.original.createdAt },
                { label: 'Updated', value: row.original.updatedAt },
              ]}
            />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation()
                openEditDialog(row.original)
              }}
              disabled={row.original.status === 'deleted'}
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <CropDetailImagesDialog detail={row.original} cropFallbackImage={cropImageMap[String(row.original.cropId)]} />
            <CropDetailStatusButton detail={row.original} />
          </div>
        ),
      },
    ],
    [cropMap, cropImageMap, openEditDialog], // FIX: added cropImageMap to deps
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Crop catalog"
        title="Crop details"
        description="Create crop detail sections with bilingual content, sequence ordering, and carousel media for each crop."
        compact
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add crop detail
          </Button>
        }
      />

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({visibleActiveDetails.length})</TabsTrigger>
          <TabsTrigger value="deleted">Deleted ({visibleDeletedDetails.length})</TabsTrigger>
          <TabsTrigger value="all">All ({visibleAllDetails.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <DataTable
            columns={columns}
            data={visibleActiveDetails}
            searchPlaceholder="Search active crop details"
            emptyMessage={activeLoading ? 'Loading crop details...' : 'No active crop details found.'}
            filterSlot={filterSlot}
          />
        </TabsContent>
        <TabsContent value="deleted">
          <DataTable
            columns={columns}
            data={visibleDeletedDetails}
            searchPlaceholder="Search deleted crop details"
            emptyMessage={deletedLoading ? 'Loading deleted crop details...' : 'No deleted crop details found.'}
            filterSlot={filterSlot}
          />
        </TabsContent>
        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={visibleAllDetails}
            searchPlaceholder="Search crop details"
            emptyMessage={activeLoading || deletedLoading ? 'Loading crop details...' : 'No crop details found.'}
            filterSlot={filterSlot}
          />
        </TabsContent>
      </Tabs>

      <CropDetailDialog
        key={editingDetail?.id || 'new-crop-detail'}
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen)
          if (!nextOpen) setEditingDetail(null)
        }}
        detail={editingDetail}
        crops={activeCrops}
      />
    </div>
  )
}

export default CropDetailsPage