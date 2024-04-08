from django.shortcuts import render, redirect
from .models import Product, Review, Comment, Like
from .forms import ProductForm, ReviewForm, CommentForm

def product_list(request):
    products = Product.objects.all()


    sort_by = request.GET.get('sort_by')
    if sort_by == 'name':
        products = Product.objects.order_by('name')
    elif sort_by == 'category':
        products = Product.objects.order_by('category__name')


    search_query = request.GET.get('search')
    if search_query:
        products = products.filter(name__icontains=search_query)

    return render(request, 'product_list.html', {'products': products})

def product_detail(request, pk):
    product = Product.objects.get(pk=pk)
    return render(request, 'product_detail.html', {'product': product})

def product_create(request):
    if request.method == 'POST':
        form = ProductForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('product_list')
    else:
        form = ProductForm()
    return render(request, 'product_form.html', {'form': form})

