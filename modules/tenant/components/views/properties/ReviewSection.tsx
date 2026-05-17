import React from "react";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";
import { Star, MessageSquare, Loader2, Edit3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { usePropertyReviews } from "@/modules/tenant/data/queries/useReviews";
import { useCreateReview } from "@/modules/tenant/data/mutations/useCreateReview";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import useMe from "@/modules/auth/data/queries/useMe";

interface ReviewSectionProps {
  propertyId: string;
}

export function ReviewSection({ propertyId }: ReviewSectionProps) {
  const { data: meData } = useMe();
  const currentUser = meData?.user;
  const { data: reviews, isLoading } = usePropertyReviews(propertyId);
  const { mutate: createReview, isPending: submitting } = useCreateReview();
  
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [showAllReviews, setShowAllReviews] = React.useState(false);

  const visibleReviews = React.useMemo(() => {
    if (!reviews) return [];
    return showAllReviews ? reviews : reviews.slice(0, 3);
  }, [reviews, showAllReviews]);

  // Find if current user has a review
  const myReview = React.useMemo(() => {
    if (!reviews || !currentUser) return null;
    return reviews.find(r => r.tenant?.userId === currentUser.id);
  }, [reviews, currentUser]);

  // Pre-fill form if user has a review
  React.useEffect(() => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment);
    }
  }, [myReview]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    createReview({
      propertyId,
      rating,
      comment
    });
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-creme-brulee" /></div>;

  return (
    <div className="space-y-8 mt-0">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-inkwell">Reseñas de la comunidad</h3>
        <div className="flex items-center gap-2 bg-creme-brulee/10 px-4 py-2 rounded-full">
          <Star className="w-5 h-5 text-creme-brulee fill-current" />
          <span className="text-lg font-bold text-creme-brulee">
            {reviews && reviews.length > 0 
              ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
              : "0.0"}
          </span>
          <span className="text-sm text-creme-brulee/60 font-medium">({reviews?.length || 0})</span>
        </div>
      </div>

      {/* Write or Edit a Review */}
      <Card className="border border-au-lait rounded-2xl p-6 shadow-sm bg-white overflow-hidden relative">
        <div className={`absolute top-0 left-0 w-1 h-full ${myReview ? 'bg-amber-400' : 'bg-creme-brulee'}`} />
        <CardContent className="p-0 space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-bold text-inkwell">
              {myReview ? "Actualizar tu experiencia" : "Cuéntanos tu experiencia"}
            </h4>
            {myReview && <Edit3 className="w-4 h-4 text-amber-500" />}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-8 h-8 ${
                      star <= (hover || rating) 
                        ? (myReview ? "text-amber-400 fill-current" : "text-creme-brulee fill-current")
                        : "text-slate-200"
                    }`} 
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-lunar-eclipse">
                {rating > 0 ? `${rating} estrellas` : "Selecciona una calificación"}
              </span>
            </div>
            
            <Textarea
              placeholder="Escribe tu comentario sobre el cuarto, la zona o el arrendador..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] rounded-xl border-au-lait focus:ring-creme-brulee focus:border-creme-brulee"
              required
            />
            
            <Button 
              type="submit" 
              disabled={submitting || rating === 0}
              className={`${myReview ? 'bg-amber-500 hover:bg-amber-600' : 'bg-creme-brulee hover:bg-creme-brulee/90'} text-white rounded-xl px-8 font-bold shadow-md shadow-creme-brulee/20`}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (
                myReview ? <Edit3 className="w-4 h-4 mr-2" /> : <MessageSquare className="w-4 h-4 mr-2" />
              )}
              {myReview ? "Actualizar reseña" : "Publicar reseña"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews && reviews.length > 0 ? (
          <>
            {visibleReviews.map((review) => (
              <Card key={review.id} className="border border-au-lait rounded-2xl p-6 shadow-sm bg-white hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar className="size-12 border border-slate-100">
                    <AvatarImage src={review.tenant.user.profilePicture} />
                    <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                      {review.tenant.user.fullName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-inkwell">{review.tenant.user.fullName}</h5>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {format(new Date(review.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${
                              i < review.rating ? "text-creme-brulee fill-current" : "text-slate-200"
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-lunar-eclipse leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
            
            {reviews.length > 3 && (
              <Button
                variant="outline"
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="w-full mt-4 cursor-pointer rounded-xl border-au-lait text-inkwell font-bold hover:bg-slate-50"
              >
                {showAllReviews ? "Ver menos reseñas" : `Ver todas las reseñas (${reviews.length})`}
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-au-lait">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lunar-eclipse font-medium">Aún no hay reseñas. ¡Sé el primero en comentar!</p>
          </div>
        )}
      </div>
    </div>
  );
}
