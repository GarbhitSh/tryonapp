import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, FlatList } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Share2, ArrowRight } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const products = [
  {
    id: 1,
    productImage: require('../../assets/products/product1.jpg'),
    tryOnImage: require('../../assets/tryons/tryon1.jpg'),
    tryOnGif: require('../../assets/gifs/tryon1.gif'),
    name: 'Classic White Sneakers',
    price: '$99.99',
    brand: 'Nike',
    description: 'Timeless design meets modern comfort'
  },
  {
    id: 2,
    productImage: require('../../assets/products/product2.jpg'),
    tryOnImage: require('../../assets/tryons/tryon2.jpg'),
    tryOnGif: require('../../assets/gifs/tryon2.gif'),
    name: 'Red Running Shoes',
    price: '$129.99',
    brand: 'Adidas',
    description: 'Performance meets style'
  },
  {
    id: 3,
    productImage: require('../../assets/products/product3.jpg'),
    tryOnImage: require('../../assets/tryons/tryon3.jpg'),
    tryOnGif: require('../../assets/gifs/tryon3.gif'),
    name: 'Designer Boots',
    price: '$199.99',
    brand: 'Gucci',
    description: 'Luxury craftsmanship at its finest'
  },
  {
    id: 4,
    productImage: require('../../assets/products/product4.jpg'),
    tryOnImage: require('../../assets/tryons/tryon4.jpg'),
    tryOnGif: require('../../assets/gifs/tryon4.gif'),
    name: 'Sports Sneakers',
    price: '$149.99',
    brand: 'Puma',
    description: 'Engineered for peak performance'
  },
  {
    id: 5,
    productImage: require('../../assets/products/product5.jpg'),
    tryOnImage: require('../../assets/tryons/tryon5.jpg'),
    tryOnGif: require('../../assets/gifs/tryon5.gif'),
    name: 'Limited Edition Sneakers',
    price: '$179.99',
    brand: 'New Balance',
    description: 'Exclusive design, limited quantities'
  }
];

function ViewModeIndicator({ currentMode }: { currentMode: 'product' | 'tryOn' | 'gif' }) {
  return (
    <View style={styles.viewModeContainer}>
      <View style={[styles.dot, currentMode === 'product' && styles.activeDot]} />
      <View style={[styles.dot, currentMode === 'tryOn' && styles.activeDot]} />
      <View style={[styles.dot, currentMode === 'gif' && styles.activeDot]} />
    </View>
  );
}

function ProductCard({ product }) {
  const [viewMode, setViewMode] = useState<'product' | 'tryOn' | 'gif'>('product');
  const [liked, setLiked] = useState(false);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const gesture = Gesture.Pan()
    .onBegin(() => {
      scale.value = withSpring(0.95);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      scale.value = withSpring(1);
      if (event.translationX < -50) {
        if (viewMode === 'product') {
          runOnJS(setViewMode)('tryOn');
        } else if (viewMode === 'tryOn') {
          runOnJS(setViewMode)('gif');
        }
      } else if (event.translationX > 50) {
        if (viewMode === 'gif') {
          runOnJS(setViewMode)('tryOn');
        } else if (viewMode === 'tryOn') {
          runOnJS(setViewMode)('product');
        }
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value }
    ],
  }));

  const getCurrentImage = () => {
    switch (viewMode) {
      case 'tryOn':
        return product.tryOnImage;
      case 'gif':
        return product.tryOnGif;
      default:
        return product.productImage;
    }
  };

  const handleLike = useCallback(() => {
    setLiked(prev => !prev);
  }, []);

  const handleShare = useCallback(() => {
    // Implement share functionality
    console.log('Share:', product.name);
  }, [product.name]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.productContainer, animatedStyle]}>
        <Image
          source={getCurrentImage()}
          style={styles.productImage}
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />

        <View style={styles.header}>
          <Text style={styles.brandName}>{product.brand}</Text>
          <ViewModeIndicator currentMode={viewMode} />
        </View>

        <View style={styles.productInfo}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
            <Text style={styles.productPrice}>{product.price}</Text>
          </View>

          <View style={styles.actionRow}>
            <View style={styles.socialActions}>
              <TouchableOpacity onPress={handleLike} style={styles.iconButton}>
                <Heart size={24} color={liked ? '#ff4b4b' : '#fff'} fill={liked ? '#ff4b4b' : 'none'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                <Share2 size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.buyButton} 
              onPress={() => console.log('Buy:', product.name)}
            >
              <Text style={styles.buyButtonText}>Buy Now</Text>
              <ArrowRight size={20} color="#000" style={styles.buyButtonIcon} />
            </TouchableOpacity>
          </View>

          {viewMode !== 'product' && (
            <Text style={styles.swipeHint}>
              Swipe {viewMode === 'tryOn' ? 'right for product view' : 'left for try-on view'}
            </Text>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export default function FeedScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  productContainer: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: '#000',
  },
  productImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.6,
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  brandName: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  productInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  productName: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
  },
  description: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    maxWidth: SCREEN_WIDTH * 0.6,
  },
  productPrice: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  socialActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  buyButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#000',
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginRight: 8,
  },
  buyButtonIcon: {
    marginLeft: 4,
  },
  swipeHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 20,
  },
});